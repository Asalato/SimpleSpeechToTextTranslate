let editor, style;
const defaultValue = `
background-color: #FFFFFF;
color: #000000;
font-size: 2rem;
font-family: arial;
-webkit-text-stroke: #000000;
height: 7rem;
`;

function attach () {
    style.innerHTML = '.box{' + editor.getValue() + '}';
}

window.addEventListener('load', () => {
    editor = ace.edit('css-editor');
    const mode = ace.require('ace/mode/text').Mode;
    editor.getSession().setMode(new mode());
    editor.setOptions({fontSize: '1.3rem'});

    style = document.getElementById('css-editable');
    editor.on('change', () => {
        save();
        attach();
    });
    load();
    attach();
});


function save() {
    document.cookie = '_style_=' + encodeURIComponent(editor.getValue());
}

function load() {
    const data = document.cookie.split('; ').find(elm => elm.startsWith('_style_'));
    if(data !== undefined) editor.setValue(decodeURIComponent(data.split('=')[1]), -1);
    else editor.setValue(defaultValue, -1);
}