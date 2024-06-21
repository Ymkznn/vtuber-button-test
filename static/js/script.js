$(document).ready(function() {
    handleSliderProgress();
    // post loading
    var group2 = $('.input-group-2');
    var dropdown = $('.dropdown');
    if ($(window).width() < 768) {
        group2.detach().insertAfter(dropdown);
    }else{
        dropdown.detach().insertAfter(group2);
    }
    
    // if screen width updated
    $(window).on('resize', function() {
        if ($(window).width() < 768) {
            group2.detach().insertAfter(dropdown);
        }else{
            dropdown.detach().insertAfter(group2);
        }
    })

    // esc key's action
    $(document).on('keydown', function(event) {
        $('#search').focus()
        if (event.key === 'Escape') {
            $('#search').val('');
            $('#clear-text-button').hide();
            $('#search').trigger('input');
        }
    });

    //create audio file for playing
    let audioCtx,gainNode,echoEffectNode;// create effect's node
    let source;
    let currentAudio = null; // now playing audio
    $(".play-audio").click(function(){
        //autopause check
        if ($("#flexCheckChecked").prop('checked')){
            if (currentAudio !=null){
                currentAudio.pause();
            }
            $('.play-audio .progress').remove();
        }else{
            $(this).find('.progress').remove();
        }
        // set audio node
        let audioFileName = $(this).data('audio');
        let encodedFileName = encodeURIComponent(audioFileName);
        let audioFile = '/static/audios/' + encodedFileName;
        let audio = new Audio(audioFile);
        currentAudio = audio;
        
        // set effect node
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioCtx.createGain();
        echoEffectNode = createEchoEffect(audioCtx);
        source = audioCtx.createMediaElementSource(audio);
        
        // set volume node
        source.connect(gainNode)
        $("#volumeRange").trigger('input');

        // check echo effect node
        $("#echoCheckChecked").trigger('input');
        
        // progress bar animation
        const progressContainer = $('<div>').addClass('progress');
        const progressBar = $('<div>').addClass('progress-bar').css('width', '0%');
        progressContainer.append(progressBar);
        $(this).append(progressContainer);
        const interval = 100; // Update interval in milliseconds
        progressInterval = setInterval(() => {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.css('width', progress + '%');
        }, interval);
        
        currentAudio.play();
    });

    // volume node's action
    $("#volumeRange").on('input', function() {
        if (gainNode){
            gainNode.gain.value = this.value*0.01;
        }
    });
    
    // echo effect node's update time limit 
    const throttledUpdateEcho = throttle(function(impulseValue) {
        const sampleRate = audioCtx.sampleRate;
        const length = sampleRate * (impulseValue / 33); // max 3 seconds
        const impulse = audioCtx.createBuffer(2, length, sampleRate);
        const impulseL = impulse.getChannelData(0);
        const impulseR = impulse.getChannelData(1);
        for (let i = 0; i < length; i++) {
            impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1);
            impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1);
        }
        echoEffectNode.reverbNode.buffer = impulse;
    }, 500);

    // echo effect node's action
    $("#echoCheckChecked").on('input', function() {
        if (echoEffectNode){
            if (this.value == 0){
                gainNode.disconnect();
                echoEffectNode.outputNode.disconnect();
                gainNode.connect(audioCtx.destination);
            }else{
                throttledUpdateEcho(this.value);
                gainNode.disconnect();
                gainNode.connect(echoEffectNode.inputNode);
                echoEffectNode.outputNode.connect(audioCtx.destination);
            }
        }
    });

    // collapse/expand category container
    $(".category_area").on('click', function() {
        $("#"+this.id).siblings('.row').find('.cate-body').slideToggle();
        var $span = $("#"+this.id).siblings('.button-subdirectory').find('.content');
        if ($span.text() === '▲') {
          $span.text('▼');
        } else {
          $span.text('▲');
        }
    })

    // collapse/expand category container on button
    $(".button-subdirectory").on('click', function() {
        $(this).siblings('.row').find('.cate-body').slideToggle();
        var $span = $(this).find('.content'); // 找到按鈕内的 .content 元素
        if ($span.text() === '▲') {
          $span.text('▼'); // 如果文本是▲，则改为▼
        } else {
          $span.text('▲'); // 否则改回▲
        }
    });

    //back to top
    $('#site-title').click(function(){
        $('html, body').animate({scrollTop : 0},0);
        return false;
    });

    // language switch
    $('.lang-switch').click(function() {
        const lang = $(this).data('lang');
        switchLanguage(lang);
    });
    
    // use to clear search box
    $('#clear-text-button').on('click', function() {
        $('#search').val('');
        $('#clear-text-button').hide();
        $('#search').trigger('input')
    });

    // real time search button
    $('#search').on('input', function() {
        var content = $(this).val();
        $("button").each(function() {
            if ($(this).attr('id') === 'offcanvasNavbarbutton'||$(this).hasClass('button-subdirectory')) {
                return true; // 直接跳过当前循环，继续下一个按钮
            }
            if ($(this).text().includes(content)) {
                $(this).show(); // 显示符合条件的按钮
            } else {
                $(this).hide(); // 隐藏不符合条件的按钮
            }
        })
        $('#clear-text-button').show();
        if (!content){
            $('#clear-text-button').hide();
        }
    });

    //search box's visual effect
    $('#search').on('focus', function() {
        $("#search-icon").css('border-color', '#6eb1de');
        $("#search-icon").css('background-color', '#fafafa');
    })
    $('#search').on('blur', function() {
        $("#search-icon").css('border-color', '#fff'); // 移除自定义类名恢复原始样式
        $("#search-icon").css('background-color', '#fff');
    });
});

// request json and change text language
function switchLanguage(lang) {
    // switch site's language
    let postData = { "lang": lang };
    $.when(
        $.ajax({
            url: '/data_request',
            method: 'POST',
            dataType: 'json',
            data: JSON.stringify(postData),
            contentType: 'application/json'
        })
    ).done(function(textsData) {
        document.title = textsData.title; // update title
        $.each(textsData, function(categoryTag, data) {
            if (data !=null){
                if ($('#' + categoryTag).children().length > 0){
                    $('#' + categoryTag).children("span").text(data);
                }else{
                    $('#' + categoryTag).text(data);
                }
            }
        });
        $('html').attr('lang', lang); //change html attr
        $('#search').attr('placeholder', textsData.search); //change html attr
    }).fail(function(error) {
        console.error('Error fetching language files:', error);
    });
}

// Define a function to handle input range elements with class 'slider-progress'
function handleSliderProgress() {
    // Get all input range elements with class 'slider-progress'
    const sliders = document.querySelectorAll('input[type="range"].slider-progress');

    // Loop through each input range element
    sliders.forEach(slider => {
        // Set initial CSS custom properties based on the input attributes
        slider.style.setProperty('--value', slider.value);
        slider.style.setProperty('--min', slider.min === '' ? '0' : slider.min);
        slider.style.setProperty('--max', slider.max === '' ? '100' : slider.max);

        // Add event listener for 'input' event to update CSS custom property '--value'
        slider.addEventListener('input', () => {
            slider.style.setProperty('--value', slider.value);
        });
    });
}

// create customize Echo Effect node
function createEchoEffect(audioCtx) {
    const inputNode = audioCtx.createGain();
    const reverbNode = audioCtx.createConvolver();
    const outputNode = audioCtx.createGain();
    const wet = audioCtx.createGain();
    const dry = audioCtx.createGain();

    wet.gain.value = 0.5;
    dry.gain.value = 0.5;

    inputNode.connect(reverbNode);
    reverbNode.connect(wet);
    inputNode.connect(dry);
    dry.connect(outputNode);
    wet.connect(outputNode);

    return {
        inputNode: inputNode,
        reverbNode: reverbNode,
        outputNode: outputNode,
        wet: wet,
        dry: dry
    };
}

// set time limet to exec function
function throttle(func, delay) {
    let lastExecTime = 0;
    return function(...args) {
        const currentTime = Date.now();
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        }
    };
}