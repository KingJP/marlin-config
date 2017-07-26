var git = require('simple-git');
var exec = require('child_process').exec;
var promisify = require('./helpers').promisify;
var root;


var gitRoot=(dir)=>
  promisify('revparse',git(dir))(['--show-toplevel'])
  .then(str=>str.replace(/\r|\n/,''))
  .then(str=>(console.log('[gitRoot]',str),root=str))
  .catch(mst=>{ console.log('no root'); throw mst});

gitRoot().catch(a=>a);

var gitTag=()=>
new Promise((done,fail)=>git(root).raw(['describe','--tags'],(e,a)=>e?fail(e):done(a.replace(/\r|\n/,''))))
.then(root=>(console.log('[gitTag]',root),root))
.catch(mst=>console.log('no tag'))

var getTag=msg=>{
  var m=msg.match(/\(tag:\s(.*)\)/)
  return m&&m[1];
}
var simplyTag=o=>o.all.map(i=>({date:i.date,tag:getTag(i.message)})).filter(i=>i.tag) //m=?m[1]:
var gitTags=(verbose)=>
new Promise((done,fail)=>git(root).log(['--tags','--simplify-by-decoration'],(e,a)=>e?fail(e):done(a))) //,'--pretty="format:%ci %d"'
.then(simplyTag)
.then(root=>(verbose&&console.log('[gitTags]',root),root))
.catch(mst=>console.log('no tags'))

exports.Checkout=(branch)=>promisify('checkout',git(root))(branch);
exports.Status=()=>promisify('status',git(root))();
exports.Fetch=()=>promisify('fetch',git(root))(['--all']);
exports.Tag=gitTag;
exports.Tags=gitTags;
exports.Show=(branch,file)=>promisify('show',git(root))([branch+':'+file]);
exports.git=git;
exports.root=a=>a?gitRoot(a):root?Promise.resolve(root):Promise.reject();

exports.clone=name=>new Promise((done,fail)=>{
  var cmd = exec('git clone https://github.com/MarlinFirmware/Marlin.git '+(name||''));
  var timer = setInterval(a=>process.stdout.write("."), 500)
  cmd.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  cmd.stderr.on('data', (data) => {
    console.log(data.toString());
  });
  cmd.on('close', (code) => {
    clearInterval(timer);
    console.log();
    if (code == 0)
      done(name);
    else
      fail();
  });
})