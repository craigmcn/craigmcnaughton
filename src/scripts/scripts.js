// Grab HTML Elements
const btn = document.querySelector('button.js-collapse')
const menu = document.querySelector('#nav-collapse')

// Add Event Listeners
btn.addEventListener('click', () => {
    menu.classList.toggle('hidden')
})
