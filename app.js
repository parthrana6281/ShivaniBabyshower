let supabaseClient = null;
let currentFamily = null;
let currentGuest = null;
let selections = {};
let existingResponses = {}; // guest_name -> response, already saved in Supabase

function normalize(v){return v.trim().toLowerCase().replace(/\s+/g," ")}
function showMessage(id,text){document.getElementById(id).textContent=text}

function findFamily(first,last){
  const full=normalize(`${first} ${last}`);
  return SITE_CONFIG.families.find(f=>f.guests.some(g=>normalize(g)===full));
}

function openInvitation(family,guest){
  currentFamily=family; currentGuest=guest;
  document.getElementById("guestDisplay").textContent=guest;
  document.getElementById("locationName").textContent=SITE_CONFIG.locationName;
  document.getElementById("locationAddress").textContent=SITE_CONFIG.locationAddress;
  const link=document.getElementById("registryLink");
  if(SITE_CONFIG.babylistUrl){link.href=SITE_CONFIG.babylistUrl;link.style.display="inline-block"}else{link.style.display="none"}
  const audio=document.getElementById("bgMusic");
  if(audio){audio.volume=0.55;audio.play().catch(()=>{});}
  document.getElementById("entry").classList.add("opening");
  setTimeout(()=>{
    document.getElementById("entry").classList.add("hidden");
    document.getElementById("invite").classList.remove("hidden");
    window.scrollTo({top:0,behavior:"smooth"});
  },1100);
}

document.getElementById("guestForm").addEventListener("submit",e=>{
  e.preventDefault();
  const first=document.getElementById("firstName").value.trim();
  const last=document.getElementById("lastName").value.trim();
  const family=findFamily(first,last);
  if(!family){showMessage("entryMessage","We couldn't find that invitation. Please check the spelling or contact the host.");return}
  const guest=family.guests.find(g=>normalize(g)===normalize(`${first} ${last}`));
  showMessage("entryMessage","");
  openInvitation(family,guest);
});

async function loadExistingResponses(){
  existingResponses={};
  if(!supabaseClient || !currentFamily) return;
  const {data,error}=await supabaseClient
    .from("rsvps")
    .select("guest_name,response")
    .eq("family_id",currentFamily.id);
  if(error){console.error(error);return}
  data.forEach(row=>{existingResponses[row.guest_name]=row.response});
}

function renderRsvpPeople(){
  selections={};
  const box=document.getElementById("rsvpPeople");
  box.innerHTML="";
  currentFamily.guests.forEach(name=>{
    const locked=Boolean(existingResponses[name]);
    if(locked) selections[name]=existingResponses[name];
    const row=document.createElement("div");row.className="person";
    row.innerHTML=`<div class="person-name">${name}${locked?' <span class="locked-tag">Submitted</span>':''}</div>
      <div class="choices">
        <button type="button" class="choice${locked&&existingResponses[name]==="yes"?" selected":""}${locked?" locked":""}" data-name="${name}" data-value="yes" ${locked?"disabled":""}>YES, I'M COMING</button>
        <button type="button" class="choice${locked&&existingResponses[name]==="no"?" selected":""}${locked?" locked":""}" data-name="${name}" data-value="no" ${locked?"disabled":""}>NO, CAN'T MAKE IT</button>
      </div>`;
    box.appendChild(row);
  });
  box.querySelectorAll(".choice:not(.locked)").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const name=btn.dataset.name;
      selections[name]=btn.dataset.value;
      box.querySelectorAll(`.choice[data-name="${CSS.escape(name)}"]`).forEach(x=>x.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  const allLocked=currentFamily.guests.every(name=>existingResponses[name]);
  const submitBtn=document.getElementById("submitRsvp");
  if(allLocked){
    submitBtn.classList.add("hidden");
    showMessage("rsvpMessage","Your RSVP has already been submitted and can't be changed. Contact the host if something needs to be corrected.");
  }else{
    submitBtn.classList.remove("hidden");
    showMessage("rsvpMessage","");
  }
}

async function openRsvp(){
  if(!currentFamily)return;
  const box=document.getElementById("rsvpPeople");
  box.innerHTML="<p class=\"message\">Loading…</p>";
  document.getElementById("rsvpModal").classList.remove("hidden");
  document.getElementById("rsvpModal").setAttribute("aria-hidden","false");
  await loadExistingResponses();
  renderRsvpPeople();
}

document.getElementById("rsvpOpen").addEventListener("click",openRsvp);

document.querySelectorAll("[data-close]").forEach(el=>el.addEventListener("click",()=>{
  document.getElementById("rsvpModal").classList.add("hidden");
}));

document.getElementById("submitRsvp").addEventListener("click",async()=>{
  const namesToSubmit=currentFamily.guests.filter(n=>!existingResponses[n]);
  const missing=namesToSubmit.filter(n=>!selections[n]);
  if(missing.length){showMessage("rsvpMessage","Please select YES or NO for everyone listed.");return}
  const btn=document.getElementById("submitRsvp");btn.disabled=true;btn.textContent="Saving RSVP…";
  try{
    if(!supabaseClient) throw new Error("Supabase is not configured yet.");
    const rows=namesToSubmit.map(name=>({
      family_id:currentFamily.id,
      family_name:currentFamily.displayName,
      guest_name:name,
      response:selections[name],
      submitted_by:currentGuest
    }));
    // Plain insert (not upsert) so an already-submitted guest can never be overwritten,
    // even if someone replays this request directly against the API.
    const {error}=await supabaseClient.from("rsvps").insert(rows);
    if(error){
      if(error.code==="23505"){
        showMessage("rsvpMessage","Looks like this RSVP was already submitted while this was open elsewhere. Refreshing…");
        await loadExistingResponses();
        renderRsvpPeople();
        return;
      }
      throw error;
    }
    const combined={...existingResponses};
    namesToSubmit.forEach(n=>{combined[n]=selections[n]});
    const yes=currentFamily.guests.filter(n=>combined[n]==="yes");
    const no=currentFamily.guests.filter(n=>combined[n]==="no");
    document.getElementById("rsvpModal").classList.add("hidden");
    document.getElementById("successTitle").textContent="RSVP received! ♡";
    document.getElementById("successText").textContent=`${yes.length} coming · ${no.length} not coming. Thank you, ${currentGuest}! Your response is now locked in and can't be changed.`;
    document.getElementById("successModal").classList.remove("hidden");
  }catch(err){
    console.error(err);
    showMessage("rsvpMessage","We couldn't save your RSVP yet. Please try again.");
  }finally{btn.disabled=false;btn.innerHTML="Submit RSVP <span>♡</span>"}
});

document.getElementById("closeSuccess").addEventListener("click",()=>document.getElementById("successModal").classList.add("hidden"));
document.getElementById("changeGuest").addEventListener("click",()=>{
  document.getElementById("invite").classList.add("hidden");
  document.getElementById("entry").classList.remove("hidden","opening");
  document.getElementById("guestForm").reset();
  currentFamily=null;currentGuest=null;
  const audio=document.getElementById("bgMusic");
  if(audio){audio.pause();audio.currentTime=0;}
  window.scrollTo({top:0,behavior:"smooth"});
});

document.getElementById("musicToggle").addEventListener("click",()=>{
  const audio=document.getElementById("bgMusic");
  const btn=document.getElementById("musicToggle");
  if(!audio)return;
  if(audio.paused){audio.play().catch(()=>{});btn.classList.remove("muted");btn.textContent="♪";}
  else{audio.pause();btn.classList.add("muted");btn.textContent="✕";}
});

if(SITE_CONFIG.supabaseUrl.startsWith("http") && !SITE_CONFIG.supabaseUrl.includes("TODO")){
  supabaseClient=window.supabase.createClient(SITE_CONFIG.supabaseUrl,SITE_CONFIG.supabaseAnonKey);
}
