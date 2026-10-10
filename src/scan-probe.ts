// A probe for the code scanning gate. Not for merging.
document.body.innerHTML = location.hash;
location.href = new URLSearchParams(location.search).get('next') || '/';
export const fromHash = eval(location.hash);
