import {writable, derived} from 'svelte/store';

export const session = writable();
export const localHat = writable([
    {word:'bunny',outOfHat:true},
    {word:'dog',outOfHat:false},
    {word:'snake',outOfHat:true},
    {word:'deer',outOfHat:true},
    {word:'elephant',outOfHat:true, current:true},
]);


const API_URL = '/.netlify/functions/session'

export async function updateSessionDB (data) {
     const postData = JSON.stringify(
         data
     );
     const response = await fetch(
         API_URL,
         {method:'POST',
          body:postData}
     );
     try {
         const json = await response.json()
         console.log('Updated!',postData,'=>',json);
         session.update(s => sessionFromJson(json));
     }
     catch (err) {
         console.log('Submitted',postData);
         console.log('Unable to parse response :(');
         debugger;
     }
 }

export function sessionFromJson (json) {
     if (json && json.data && json.ref) {
         return {
             ...json.data,
             id:json.ref['@ref'].id
         }
     }
     else {
         console.log('FAILED TO GET MEANINGFUL SESSION');
         console.log('uh oh',json);
         return undefined;
     }
 }
