A javascript emulator for nes, snes, and more!
The BEST emulator on the internet. No ads and self hosted!


```
EJS_gameName = "name of game";
```
When the user saves a state, the state will be saved with the name `name of game.state`


<h1>Supported systems!</h1>
<h2>NES / Famicom</h2>

Code example

```
<div style="width:640px;height:480px;max-width:100%">
  <div id="game"></div>
</div>
<script type="text/javascript">
    EJS_player = '#game';
    EJS_biosUrl = ''; // Url to Famicom Disk System bios
    EJS_gameUrl = ''; // Url to Game rom
    EJS_core = 'nes';
    EJS_lightgun = false; // Lightgun
    EJS_pathtodata = 'data/'; //path to all of the wasm and js files. MUST all be in the same directory!!
</script>
<script src="data/loader.js"></script>
```
Your rom MUST have one of the following extensions

```
.fds
.nes
.unif
.unf
```
You can find the famicon BIOS by looking up the md5 sum which is `ca30b50f880eb660a320674ed365ef7a`
<br><br>
<h2>SNES</h2>

Code Example

```
<div style="width:640px;height:480px;max-width:100%">
        <div id="game"></div>
      </div>
<script type="text/javascript">
    EJS_player = '#game';
    EJS_gameUrl = ''; // Url to Game rom
    EJS_core = 'snes';
    EJS_mouse = false; // SNES Mouse
    EJS_multitap = false; // SNES Multitap
    EJS_pathtodata = 'data/'; //path to all of the wasm and js files. MUST all be in the same directory!!
</script>
<script src="data/loader.js"></script>
```
Your rom MUST have one of the following extensions

```
.smc
.fig
.sfc
.gd3
.gd7
.dx2
.bsx
.swc
```
There is no bios for this system
<br><br>

<br><br>
