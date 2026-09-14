let supabaseClient = null;
let currentFamily = null;
let currentGuest = null;
let selections = {};

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

function openRsvp(){
  if(!currentFamily)return;
  selections={};
  const box=document.getElementById("rsvpPeople");
  box.innerHTML="";
  currentFamily.guests.forEach(name=>{
    const row=document.createElement("div");row.className="person";
    row.innerHTML=`<div class="person-name">${name}</div>
      <div class="choices">
        <button type="button" class="choice" data-name="${name}" data-value="yes">YES, I'M COMING</button>
        <button type="button" class="choice" data-name="${name}" data-value="no">NO, CAN'T MAKE IT</button>
      </div>`;
    box.appendChild(row);
  });
  box.querySelectorAll(".choice").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const name=btn.dataset.name;
      selections[name]=btn.dataset.value;
      box.querySelectorAll(`.choice[data-name="${CSS.escape(name)}"]`).forEach(x=>x.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
  document.getElementById("rsvpMessage").textContent="";
  document.getElementById("rsvpModal").classList.remove("hidden");
  document.getElementById("rsvpModal").setAttribute("aria-hidden","false");
}

document.getElementById("rsvpOpen").addEventListener("click",openRsvp);

document.querySelectorAll("[data-close]").forEach(el=>el.addEventListener("click",()=>{
  document.getElementById("rsvpModal").classList.add("hidden");
}));

document.getElementById("submitRsvp").addEventListener("click",async()=>{
  const missing=currentFamily.guests.filter(n=>!selections[n]);
  if(missing.length){showMessage("rsvpMessage","Please select YES or NO for everyone listed.");return}
  const btn=document.getElementById("submitRsvp");btn.disabled=true;btn.textContent="Saving RSVP…";
  try{
    if(!supabaseClient) throw new Error("Supabase is not configured yet.");
    const rows=currentFamily.guests.map(name=>({
      family_id:currentFamily.id,
      family_name:currentFamily.displayName,
      guest_name:name,
      response:selections[name],
      submitted_by:currentGuest
    }));
    const {error}=await supabaseClient.from("rsvps").upsert(rows,{onConflict:"family_id,guest_name"});
    if(error)throw error;
    const yes=currentFamily.guests.filter(n=>selections[n]==="yes");
    const no=currentFamily.guests.filter(n=>selections[n]==="no");
    document.getElementById("rsvpModal").classList.add("hidden");
    document.getElementById("successTitle").textContent="RSVP received! ♡";
    document.getElementById("successText").textContent=`${yes.length} coming · ${no.length} not coming. Thank you, ${currentGuest}!`;
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
  window.scrollTo({top:0,behavior:"smooth"});
});

if(SITE_CONFIG.supabaseUrl.startsWith("http") && !SITE_CONFIG.supabaseUrl.includes("TODO")){
  supabaseClient=window.supabase.createClient(SITE_CONFIG.supabaseUrl,SITE_CONFIG.supabaseAnonKey);
}
