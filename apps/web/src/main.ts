import { MONOREPO_CONSTANT, add } from '@repo/math';
import { dateNow } from '@repo/date';

const contentDiv = document.querySelector<HTMLDivElement>('#content')!;
const button = document.querySelector<HTMLButtonElement>('#counter')!;

// 1. Use Shared Code
console.log(`Shared Math check: 5 + 5 = ${add(5, 5)}`);

// 2. Local State
let count: number = 0;

button.addEventListener('click', () => {
    count++;
    button.innerText = `Count: ${count}`;
});

// 3. API Call
async function init() {
    try {
        const res = await fetch('http://localhost:3000/');
        const data = await res.json();

        contentDiv.innerHTML = `
      <p><strong>Local Constant:</strong> ${MONOREPO_CONSTANT}</p>
      <p><strong>API Message:</strong> ${data.message}</p>
      <p><strong>API Math:</strong> ${data.mathCheck}</p>
      <p><strong>API Math:</strong> ${dateNow()}</p>
    `;
    } catch (err) {
        contentDiv.innerText = "API Offline";
        console.error(err);
    }
}

init();