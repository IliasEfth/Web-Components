const card = document.querySelector('#card');
document.querySelector('#name-input').addEventListener('input', (event) => {
  card.setAttribute('name', event.target.value);
});

const likes = document.querySelector('#likes');
likes.addEventListener('count-changed', (event) => {
  document.querySelector('#log').textContent = `Count is now ${event.detail.count}`;
});

document.querySelector('#add-milk').addEventListener('click', () => {
  document.querySelector('#todos').addItem('Milk');
});
