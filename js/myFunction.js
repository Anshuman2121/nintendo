var gameUrl;
function myfunction(id1) {
  console.log('App in 1');
  var gameUrl = id1;
  var extension = id1.split('.').pop();
  var core, biosUrl, dosbox;
  console.log(extension);

  if (['fds', 'nes', 'unif', 'unf'].includes(extension)) {
    core = 'nes';
  } else if (['smc', 'fig', 'sfc', 'gd3', 'gd7', 'dx2', 'bsx', 'swc'].includes(extension)) {
    core = 'snes';
  } else if (['z64', 'n64'].includes(extension)) {
    core = 'n64';
  } else if (['nds', 'gba', 'gb'].includes(extension)) {
    core = 'gba';
  } else if (['smd', 'md'].includes(extension)) {
    core = 'segaCD';
    biosUrl = 'games/SegaCDbios.bin';
  } else if (extension === '7z') {
    core = 'psx';
    biosUrl = 'games/psxbios.7z';
  } else if (extension === 'zip') {
    document.body.innerHTML = '';
    var a = document.createElement('div');
    // Get the width and height of the screen
    var screenWidth =
      window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var screenHeight =
      window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    a.style =
      "width:" + screenWidth + "px;height:" + screenHeight + "px;max-width:100%;margin: auto;";
    var b = document.createElement('div');
    b.id = 'dosbox';
    a.appendChild(b);

    // Create a button to request full screen
    var btn = document.createElement('button');
    btn.innerHTML = 'Full Screen';
    btn.onclick = function () {
      dosbox.requestFullScreen();
    };

    btn.style.marginTop = '10px';
    a.appendChild(btn);

    document.body.appendChild(a);

    dosbox = new Dosbox({
      id: 'dosbox',
      onload: function (dosbox) {
        dosbox.run(gameUrl.split('_')[1], './' + gameUrl.split('_')[0]);
        dosbox.requestFullScreen();
      },
      onrun: function (dosbox, app) {
        console.log('App ' + app + ' is runned');
      }
    });
    return;
  }
  else {
    core = prompt('Input core (examples: nes, snes, n64, gb, gba, psx)');
  }
  document.body.innerHTML = '';
  var a = document.createElement('div');
  var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  a.style = "width:" + screenWidth + "px;height:" + screenHeight + "px;max-width:100%;margin: auto;";
  var b = document.createElement('div');
  b.id = 'game';
  a.appendChild(b);
  document.body.appendChild(a);
  var script = document.createElement('script');
  script.innerHTML = "EJS_player = '#game'; EJS_biosUrl = '" + (biosUrl || '') + "'; EJS_gameUrl = '" + gameUrl + "'; EJS_core = '" + core + "'; EJS_pathtodata = 'data/'; ";
  document.body.appendChild(script);
  var script = document.createElement('script');
  script.src = 'data/loader.js';
  document.body.appendChild(script);
}