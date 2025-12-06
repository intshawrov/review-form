const formView = document.getElementById("formView");
const reviewsView = document.getElementById("reviewsView");

const form = document.getElementById("reviewForm");
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const fileList = document.getElementById("fileList");

const chipsWrap = document.getElementById("ageChips");
const ageRangeInput = document.getElementById("ageRange");

const reviewsList = document.getElementById("reviewsList");
const backToForm = document.getElementById("backToForm");

const avgScoreEl = document.getElementById("avgScore");
const avgStarsEl = document.getElementById("avgStars");
const ratingFilter = document.getElementById("ratingFilter");
const ageFilter = document.getElementById("ageFilter");

// ---------- state ----------
let reviews = [
  {
    name: "Claire C",
    ageRange: "45-54",
    rating: 5,
    text: "Love this necklace! High quality. Beautiful on its own and layered with others. Easily a statement piece and a great conversation starter",
    date: "9/12/25",
    verified: true
  },
  {
    name: "Stephanie H",
    ageRange: "45-54",
    rating: 5,
    text: "I’m obsessed with my custom made necklace. It is a compliment magnet! The craftsmanship makes this feel like such a high-end, special piece. It really feels unique, personal, and thoughtfully made.",
    date: "11/12/25",
    verified: true
  }
];

// ---------- small helpers ----------
const starStr = (n) => "★★★★★☆☆☆☆☆".slice(5-n, 10-n);

function setError(el, msg){
  const field = el.closest(".field");
  if(!field) return;
  field.querySelector(".error").textContent = msg;
  el.setAttribute("aria-invalid","true");
}
function clearError(el){
  const field = el.closest(".field");
  if(!field) return;
  field.querySelector(".error").textContent = "";
  el.removeAttribute("aria-invalid");
}

function validate(){
  let ok = true;
  const title = form.elements.reviewTitle;
  const desc = form.elements.reviewDescription;
  const name = form.elements.name;
  const email = form.elements.email;

  if(!title.checkValidity()){ ok=false; setError(title, "Review title required."); }
  else clearError(title);

  if(!desc.checkValidity()){ ok=false; setError(desc, "Review description required (min 10 chars)."); }
  else clearError(desc);

  if(!name.checkValidity()){ ok=false; setError(name, "Name required."); }
  else clearError(name);

  if(!email.checkValidity()){ ok=false; setError(email, "Valid email required."); }
  else clearError(email);

  return ok;
}

// ---------- dropzone ----------
browseBtn.addEventListener("click", ()=> fileInput.click());

dropzone.addEventListener("dragover", (e)=>{
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", ()=>{
  dropzone.classList.remove("dragover");
});
dropzone.addEventListener("drop", (e)=>{
  e.preventDefault();
  dropzone.classList.remove("dragover");
  fileInput.files = e.dataTransfer.files;
  renderFiles();
});
fileInput.addEventListener("change", renderFiles);

function renderFiles(){
  fileList.innerHTML = "";
  [...fileInput.files].forEach(f=>{
    const div = document.createElement("div");
    div.className="file-item";
    div.textContent = f.name;
    fileList.appendChild(div);
  });
}

// ---------- age chips ----------
chipsWrap.addEventListener("click", (e)=>{
  const chip = e.target.closest(".chip");
  if(!chip) return;

  [...chipsWrap.children].forEach(c=>c.classList.remove("active"));
  chip.classList.add("active");
  ageRangeInput.value = chip.dataset.age;
});

// ---------- render reviews ----------
function renderAverage(){
  if(!reviews.length){
    avgScoreEl.textContent = "0.0";
    avgStarsEl.textContent = "";
    return;
  }
  const avg = reviews.reduce((s,r)=>s+r.rating,0)/reviews.length;
  avgScoreEl.textContent = avg.toFixed(1);
  avgStarsEl.textContent = "★★★★★".split("").map((_,i)=>{
    return i < Math.round(avg) ? "★" : "☆";
  }).join("");
}

function renderReviews(){
  const rFilter = ratingFilter.value;
  const aFilter = ageFilter.value;

  const filtered = reviews.filter(r=>{
    const okRating = (rFilter==="all") || (String(r.rating)===rFilter);
    const okAge = (aFilter==="all") || (r.ageRange===aFilter);
    return okRating && okAge;
  });

  reviewsList.innerHTML = "";
  filtered.forEach(r=>{
    const row = document.createElement("article");
    row.className="review-row";

    row.innerHTML = `
      <aside class="profile-card">
        <div class="profile-name">${r.name}</div>
        ${r.verified ? `<div class="verified"><span class="check"></span> Verified Buyer</div>` : ``}
        <div class="profile-meta">
          <span>Age Ranges</span>
          <span>${r.ageRange || "-"}</span>
        </div>
      </aside>

      <div class="review-body">
        <div class="review-stars">${starStr(r.rating)}</div>
        <p class="review-text">${r.text}</p>
        <div class="review-date">${r.date}</div>
      </div>
    `;
    reviewsList.appendChild(row);
  });

  renderAverage();
}

ratingFilter.addEventListener("change", renderReviews);
ageFilter.addEventListener("change", renderReviews);

// ---------- submit flow ----------
form.addEventListener("submit", (e)=>{
  e.preventDefault();
  if(!validate()) return;

  const data = Object.fromEntries(new FormData(form).entries());

  const newReview = {
    name: data.name.trim(),
    ageRange: data.ageRange || "",
    rating: 5, // screenshot form-e rating input nai, default 5
    text: `${data.reviewTitle.trim()} — ${data.reviewDescription.trim()}`,
    date: new Date().toLocaleDateString("en-GB"),
    verified: true
  };

  reviews.unshift(newReview);

  // switch view
  formView.classList.add("hidden");
  reviewsView.classList.remove("hidden");
  renderReviews();

  form.reset();
  [...chipsWrap.children].forEach(c=>c.classList.remove("active"));
  fileList.innerHTML="";
});

// back button
backToForm.addEventListener("click", ()=>{
  reviewsView.classList.add("hidden");
  formView.classList.remove("hidden");
});

// initial
renderReviews();
renderAverage();
