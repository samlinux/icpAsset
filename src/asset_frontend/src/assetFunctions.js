// (1) service import
import { asset_backend } from "../../declarations/asset_backend";

// Motoko backend canister service functions

async function serviceAddAsset(key, values){
  await asset_backend.addAsset(key, values.nameValue, values.ageValue, values.descValue);
}

async function serviceGetAllAssets(){
  const assets = await asset_backend.getAllAssets();

  return assets;
}

async function serviceRemoveAsset(key){
  await asset_backend.removeAsset(key);
}

async function serviceGetAsset(key){
  const asset = await asset_backend.getAsset(key);

  return asset;
}

async function serviceloadFilteredAssets(filterValue){
  const filteredAssets = await asset_backend.filterAssets(filterValue);
  
  return filteredAssets;
}


// Application starts here

export async function init(){
  const allAssets = await serviceGetAllAssets();

  document.querySelector('#tableBody').innerHTML = renderListData(allAssets);
  addClickEvents();
}

async function showAssetDetail(key, type){
  let asset = [];

  if(key != ''){
    asset = await serviceGetAsset(key);
  }
  else {
    asset = [];
    const newAsset = {
      age: '',
      desc: '',
      name: ''
    }
    asset.push(newAsset);
  }

document.querySelector('#detailAssetContainer').innerHTML = renderAssetDetail(key, asset);

if(key == ''){
  document.querySelector('#deleteButton').className = 'disabledButton';
  document.querySelector('#deleteButton').setAttribute('disabled', '');
}
else {
  document.getElementsByName('key')[0].setAttribute('readonly', '');
  document.getElementsByName('key')[0].className = 'readOnlyInput';
  document.querySelector('#key').className = 'readOnlyInputField';
}

assetDetailClickEvents(key, type);
}

function renderListData(assets){
  let html = '';

  assets.forEach(function(asset){
    html += `
      <tr class="tableRow" id="`+asset[0]+`">
        <td>`+asset[0]+`</td>
        <td id="`+asset[0]+`_name">`+asset[1].name+`</td>
      </tr>`;
  })

  return html;
}

function renderAssetDetail(key, asset){
  const html = `
  <div id="detail" class="detail">
  <div class="detailMain">
    <div class="formContainer">
      <form autocomplete="off">
        `+renderInputField(key, 'key', 'text', 'Key')+`
        `+renderInputField(asset[0].name, 'name', 'text', 'Name')+`
        `+renderInputField(asset[0].age, 'age', 'number', 'Age')+`
        <div class="textareaContainer">
          <label for="desc">Description</label>
          <textarea class="textarea" name="desc" cols="1" rows="2">`+asset[0].desc+`</textarea>
        </div>
        </form>
    </div>
  </div>
  <div class="detailFooter">
    <div class="buttonContainer">
      <div class="detailButton">
        <div id="saveButtonSpinner"></div>
        <button class="btn detailButtons" id="saveButton">Save</button>
      </div>
      <div class="detailButton">
        <button class="btn detailButtons" id="closeButton">Close</button>
      </div>
      <div class="detailButton">
        <div id="deleteButtonSpinner"></div>
        <button class="btn detailButtons" id="deleteButton">Delete</button>
      </div>  
    </div>
  </div>
</div>`

return html;
}

function getAllInputValues(){
  const keyValue = document.getElementsByName('key')[0].value;
  const nameValue = document.getElementsByName('name')[0].value;
  const descValue = document.getElementsByName('desc')[0].value; 
  const filterValue = document.getElementsByName('filter')[0].value;
  let ageValue = parseInt(document.getElementsByName('age')[0].value);

  if(isNaN(ageValue)){
    ageValue = 0;
  }

  const values = {
    keyValue: keyValue,
    nameValue: nameValue,
    ageValue: ageValue,
    descValue: descValue,
    filterValue: filterValue
  } 

  return values;
}


// Helper functions
async function addAsset(){
  const values = getAllInputValues();
  buttonSpinner('start', 'saveButtonSpinner');
  disableControls();

  if(await checkKeyValue(values.keyValue)){
   await serviceAddAsset(values.keyValue, values);
   await showAssetDetail(values.keyValue, 'update');
  loadFilteredAssets();
  }

  buttonSpinner('stop', 'saveButtonSpinner');
  enableControls();
}

async function saveAsset(key){
  const values = getAllInputValues();
  disableControls();
  buttonSpinner('start', 'saveButtonSpinner');

  await serviceAddAsset(key, values);

  loadFilteredAssets();
  enableControls();
  buttonSpinner('stop', 'saveButtonSpinner');
}

async function removeAsset(key){
  disableControls();

  buttonSpinner('start', 'deleteButtonSpinner');
  await serviceRemoveAsset(key);
  buttonSpinner('stop', 'deleteButtonSpinner');
  loadFilteredAssets();

  enableControls();
  addClickEvents();
  removeAssetDetail();
}

async function loadFilteredAssets(){
  const filterValue = document.querySelector('#filterInput').value;

  const filteredAssets = await serviceloadFilteredAssets(filterValue);

  document.querySelector('#tableBody').innerHTML = renderListData(filteredAssets);
  addClickEvents();
}

function renderInputField(inputValue, inputName, type, labelValue){
  const html = `
    <div id="`+inputName+`" class="inputField">
      <label for="`+inputName+`">`+labelValue+`</label>
      <input class="input" type="`+type+`" name="`+inputName+`" value="`+inputValue+`"></input>
    </div>`

  return html;
}

function removeAssetDetail(){
  if(document.querySelector('#detail') != null){
    document.querySelector('#detail').remove();
  }
}

async function assetClickHandler(target){
  removeAssetDetail();
  startDetailViewSpinner();
  await showAssetDetail(target.path[1].id, 'update');
}

async function filterClickHandler(){
  buttonSpinner('start', 'filterButtonSpinner');
  await loadFilteredAssets();
  buttonSpinner('stop', 'filterButtonSpinner');
}

async function addClickEvents(){
  document.querySelector('#addAssetButton').addEventListener('click', function(){
    showAssetDetail('', 'add');
  })

  document.querySelector('#filterAssetButton').addEventListener('click', function(){
    filterClickHandler();
  })

  document.querySelector('#filterInput').addEventListener('keypress', function(event){
    if(event.key == 'Enter'){
      filterClickHandler()
    }
  })

  for(let i = 0; i < document.getElementsByClassName('tableRow').length; i++){
    document.getElementsByClassName('tableRow')[i].addEventListener('click', assetClickHandler)
  }
}

function assetDetailClickEvents(key, type){
  document.querySelector('#saveButton').addEventListener('click', function(){
  if(type == 'update'){
    saveAsset(key);
  }
  else if(type == 'add'){
    addAsset();
  }
})

document.querySelector('#closeButton').addEventListener('click', function(){
  removeAssetDetail();
})

document.querySelector('#deleteButton').addEventListener('click', function(){
  removeAsset(key);
})
}

function buttonSpinner(type, id){
  if(type == 'start'){
    document.getElementById(id).className = 'lds-dual-ring buttonSpinner'
  }
  else if(type == 'stop'){
    document.getElementById(id).removeAttribute('class');
  }
}

function startDetailViewSpinner(){
  document.querySelector('#detailAssetContainer').innerHTML = '<div class="detailViewSpinner" id="detailViewSpinner"></div>'
}

async function checkKeyValue(key){
  let status = true;
  const asset = await serviceGetAsset(key);

  if(document.getElementsByName('key')[0].value == ''){
    status = false;
    showHint('The key needs a value.');
  }
  else if(asset.length > 0){
    status = false;
    showHint('The key already exists.');
  }

  return status;
}

function showHint(message){
  if(document.querySelector('#hint') != null){
    document.querySelector('#hint').remove();
  }

  let  div = document.createElement('div');
  div.setAttribute('id', 'hint');

  const html = `<div class="hint">`+message+`</div>`;
  
  div.innerHTML = html;
  document.querySelector('#key').appendChild(div);
}

function disableControls(){
  disableInputs();
  disableButtons();
  disableTable();
}

function enableControls(){
  enableInputs();
  enableButtons();
}

function enableInputs(){
  for(let i = 0; i < document.getElementsByClassName('disabledTextarea').length; i++){
    document.getElementsByClassName('disabledTextarea')[i].removeAttribute('disabled');
    document.getElementsByClassName('disabledTextarea')[i].className = 'textarea';
  }

  for(let i = 0; i < document.getElementsByClassName('textareaContainer').length; i++){
    document.getElementsByClassName('textareaContainer')[i].className = 'textareaContainer';
  }

  for(let i = 0; i < document.getElementsByClassName('input').length; i++){
    document.getElementsByClassName('input')[i].removeAttribute('disabled');
    document.getElementsByClassName('input')[i].className = 'input'
  }

  for(let i = 0; i < document.getElementsByClassName('inputField').length; i++){
    document.getElementsByClassName('inputField')[i].className = 'inputField';
  }
}

function disableInputs(){
  for(let i = 0; i < document.getElementsByClassName('textarea').length; i++){
    document.getElementsByClassName('textarea')[i].setAttribute('disabled', '');
    document.getElementsByClassName('textarea')[i].className = 'disabledTextarea';
  }

  for(let i = 0; i < document.getElementsByClassName('textareaContainer').length; i++){
    document.getElementsByClassName('textareaContainer')[i].className = 'textareaContainer disabledTextareaContainer';
  }

  for(let i = 0; i < document.getElementsByClassName('input').length; i++){
    document.getElementsByClassName('input')[i].setAttribute('disabled', '');
    document.getElementsByClassName('input')[i].className = 'disabledInput input'
  }

  for(let i = 0; i < document.getElementsByClassName('inputField').length; i++){
    document.getElementsByClassName('inputField')[i].className = 'disabledInputField inputField';
  }
}

function disableButtons(){
  for(let i = 0; i < document.getElementsByClassName('buttons').length; i++){
    document.getElementsByClassName('buttons')[i].setAttribute('disabled', '');
    document.getElementsByClassName('buttons')[i].className = 'buttons disabledButton';
  }

  for(let i = 0; i < document.getElementsByClassName('detailButtons').length; i++){
    document.getElementsByClassName('detailButtons')[i].setAttribute('disabled', '');
    document.getElementsByClassName('detailButtons')[i].className = 'detailButtons disabledButton';
  }
}

function enableButtons(){
  for(let i = 0; i < document.getElementsByClassName('buttons').length; i++){
    document.getElementsByClassName('buttons')[i].removeAttribute('disabled');
    document.getElementsByClassName('buttons')[i].className = 'btn buttons';
  }

  for(let i = 0; i < document.getElementsByClassName('detailButtons').length; i++){
    document.getElementsByClassName('detailButtons')[i].removeAttribute('disabled');
    document.getElementsByClassName('detailButtons')[i].className = 'detailButtons btn';
  }
}

function disableTable() {
  const tableRow = document.getElementsByClassName('tableRow');

  for(let i = 0; i < tableRow.length; i++){
    tableRow[i].removeEventListener('click', assetClickHandler);
  }
}