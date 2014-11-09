function init_video()
{
    var video = document.createElement('video');
    video.autoplay = true;
    video.loop = true;
    video.mute = true;
         
    function src_callback(sourceInfos)
    {
        var back_cam_id;

        for (var i = sourceInfos.length - 1; i >= 0; --i) {
            var sourceInfo = sourceInfos[i];
            if (sourceInfo.kind === 'video' && sourceInfo.facing === 'environment')
            {
                back_cam_id = sourceInfo.id;
                break;
            }
        }

        if (back_cam_id == null)
        {
            return;
        }

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        navigator.getUserMedia({video: {
            mandatory: {
                        maxWidth: window.innerWidth,
                        maxHeight: window.innerHeight,
                        minWidth: window.innerWidth,
                        minHeight: window.innerHeight
                        },
            optional: [{sourceId: back_cam_id}]
        }}, function(stream){
            video.src    = window.URL.createObjectURL(stream);
            //video.play();
        }, function(error){
            console.log("Failed to get a stream due to", error);
        });
    }
    
    if (typeof MediaStreamTrack === 'undefined')
    {
        // noop
    }
    else
    {
        MediaStreamTrack.getSources(src_callback);
    }

    return video;
}
   
function init_renderer()
{
    var renderer = new THREE.WebGLRenderer();
    document.body.appendChild(renderer.domElement);

    return renderer;
}

function get_cam_pos(fov_deg)
{
    //http://stackoverflow.com/questions/2866350/move-camera-to-fit-3d-scene
    // in otherwords, use definition of tan()
    // tan(fov) = opp/adj = h / d
    // (but fov and h both need to be 1/2)

    var fov_rad = fov_deg * Math.PI / 180;

    var h = Math.max(window.innerWidth, window.innerHeight) / 2;

    return h / Math.tan(fov_rad/2);
}

function init()
{
    var renderer = init_renderer();
    var video = init_video();

    // Initialize Touch
    init_touch(renderer.domElement);

    // Initialize Camera
    var cam_fov = 90;
    var camera = new THREE.PerspectiveCamera(cam_fov, window.innerWidth / window.innerHeight, 1, 99999);
    camera.position.z = get_cam_pos(cam_fov);

    // Update video source
    var vtexture = new THREE.Texture(video);

    // Initialize Shaders
    var material = new THREE.ShaderMaterial({
        uniforms: {
            texture1: { type: "t", value: vtexture },
            multiplier : { type: "f", value: 1.0 }},
        vertexShader: document.getElementById('vertexShader').innerHTML,
        fragmentShader: document.getElementById('fragmentShader').innerHTML
    });

    //var plane = new THREE.PlaneGeometry(video.videoWidth, video.videoHeight);
    var plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    var mesh = new THREE.Mesh( plane, material );

    // Initialize scene
    var scene = new THREE.Scene();
    scene.add( mesh );

    return function()
    { 
        requestAnimationFrame( arguments.callee );

        if (video.readyState === video.HAVE_ENOUGH_DATA)
        {
            vtexture.needsUpdate = true;
        }

        // update multiplier
        var m = get_curr_multiplier();
        material.uniforms.multiplier.value = m;
        document.getElementById('multiplier').innerHTML = "" + m.toFixed(2) + "x";
        localStorage.x = m;

        // resize renderer if necessary
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render( scene, camera );
    };
}
    
document.addEventListener("DOMContentLoaded", function(event){
    var animate = init();        
    animate();
});