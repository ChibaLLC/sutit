function Toast(props: { message: string, icon?: string, onClose?: string }) {
    return `<div class="flex items-center w-full p-4 text-gray-500 bg-white rounded-lg shadow min-w-96" role="alert" title="toast-default">
                <div class="inline-flex items-center justify-center flex-shrink-0 w-4 h-4 text-blue-500 bg-blue-100 rounded-s">
                    ${props.icon || ''}
                </div>
                <div class="ms-3 text-sm font-normal">${props.message}</div>
                <button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8" data-dismiss-target="#toast-default" aria-label="Close" onclick="${props.onClose}">
                    <span class="sr-only">Close</span>
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                </button>
            </div>`
}

export default defineNuxtPlugin(app => {
    window.alert = (message: string, icon?: string, onClose?: Function) => {
        const toast = Toast({
            message,
            icon: icon,
            onClose: "Array.from(document.querySelectorAll('[title=toast-default]')).pop().remove()"
        })
        const toastContainer = document.createElement('div')
        toastContainer.style.position = 'fixed'
        toastContainer.style.top = '2rem'
        toastContainer.style.left = '50%'
        toastContainer.style.transform = 'translateX(-50%)'
        toastContainer.innerHTML = toast
        document.body.appendChild(toastContainer)
    }
})