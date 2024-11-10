import type { NotificationOptions } from "~~/shared/types";
class Notification {
    private readonly notificationElement: HTMLDivElement | null = null;
    private readonly message: string;
    private readonly timeout: number | 'never';
    private readonly intensity: 'info' | 'success' | 'error';

    constructor(message: string, options?: NotificationOptions) {
        this.message = message;
        this.timeout = options?.timeout || 5000;
        this.intensity = options?.intensity || 'info';
        this.notificationElement = this.createNotification();
        this.mount();
    }

    private createNotification(): HTMLDivElement {
        const notification = document.createElement('div');
        notification.classList.add('flex', 'items-center', 'justify-between', 'rounded-md', 'p-4', 'w-1/3', 'min-w-96', 'backdrop-blur', 'notification', 'opening');
        notification.classList.add(this.intensity);

        const content = this.createContent();
        const closeButton = this.createCloseButton();

        notification.appendChild(content);
        notification.appendChild(closeButton);

        return notification;
    }

    private createContent(): HTMLElement {
        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('flex', 'items-center', 'gap-2');

        const icon = this.createIcon();
        const messageElement = document.createElement('p');
        messageElement.classList.add('text-slate-900');
        messageElement.innerHTML = this.message;

        contentWrapper.appendChild(icon);
        contentWrapper.appendChild(messageElement);

        return contentWrapper;
    }

    private createIcon(): HTMLElement {
        let svg = '';
        switch (this.intensity) {
            case 'info':
                svg = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM13 10.5V15H14V17H10V15H11V12.5H10V10.5H13ZM13.5 8C13.5 8.82843 12.8284 9.5 12 9.5C11.1716 9.5 10.5 8.82843 10.5 8C10.5 7.17157 11.1716 6.5 12 6.5C12.8284 6.5 13.5 7.17157 13.5 8Z"
                        class="fill-slate-900" />
                </svg>`
                break;
            case 'success':
                svg = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"
                        class="fill-slate-900" />
                </svg>`
                break;
            default:
                svg = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"
                        class="fill-slate-900" />
                </svg>`
                break;
        }

        const div = document.createElement('div');
        div.innerHTML = svg;
        return div
    }

    private get shownTip(): boolean {
        return localStorage.getItem('shownNotificationTip') === 'true';
    }

    private set shownTip(value: boolean) {
        localStorage.setItem('shownNotificationTip', value ? 'true' : 'false');
    }

    private createCloseButton(): HTMLElement {
        const button = document.createElement('div');
        button.classList.add('cursor-pointer', 'hover:bg-light', 'rounded-full', 'p-1');
        button.onclick = () => this.close();
        button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"
                            fill="black" />
            </svg>`;
        if (!this.shownTip) {
            const tooltip = document.createElement('div');
            tooltip.innerHTML = 'Tip: Press <code>escape</code> to close';
            tooltip.style.zIndex = '100';
            tooltip.style.display = 'none';
            tooltip.classList.add('absolute', 'text-xs', 'bg-slate-200', 'text-light', 'rounded-md', 'px-2', 'py-1', 'z-10', 'opacity-90');
            button.addEventListener("mouseenter", () => {
                const {x, y} = button.getBoundingClientRect();
                tooltip.style.top = `${y - 30}px`;
                tooltip.style.left = `${x}px`;
                tooltip.style.display = 'block';

                setTimeout(() => {
                    tooltip.style.display = 'none';
                }, 1500)
            })
            document.body.appendChild(tooltip);
            window.addEventListener('close', () => {
                this.shownTip = true;
            })
        }

        return button;
    }

    private close() {
        if (this.notificationElement) {
            this.notificationElement.classList.remove('opening');
            this.notificationElement.classList.add('closing');
            setTimeout(() => {
                this.notificationElement?.remove();
            }, 500);
        }
    }

    private mount() {
        const target = document.querySelector('#notification-dock');
        if (target && this.notificationElement) {
            target.appendChild(this.notificationElement);
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY,
                behavior: 'smooth'
            });

            if (this.timeout !== 'never') {
                setTimeout(() => {
                    this.notificationElement?.classList.remove('opening');
                    this.close();
                }, this.timeout);
            }
        } else {
            const target = document.createElement('div');
            target.id = 'notification-dock';
            document.body.appendChild(target);
            this.mount();
        }
    }
}

export default defineNuxtPlugin(() => {
    const $alert = (message: string, options?: {
        timeout?: number | 'never';
        intensity?: 'info' | 'success' | 'error';
    }) => {
        new Notification(message, options);
    }

    Object.defineProperty(window, 'alert', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: $alert
    });

    Object.defineProperty(window, 'alertError', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: (message: string, options?: {
            timeout?: number | 'never';
        }) => {
            new Notification(message, {...options, intensity: 'error'});
        }
    });

    Object.defineProperty(window, 'alertSuccess', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: (message: string, options?: {
            timeout?: number | 'never';
        }) => {
            new Notification(message, {...options, intensity: 'success'});
        }
    });

    Object.defineProperty(window, 'alertInfo', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: (message: string, options?: {
            timeout?: number | 'never';
        }) => {
            new Notification(message, {...options, intensity: 'info'});
        }
    });


    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const notificationDock = document.querySelector('#notification-dock');
            if (!notificationDock) return;

            const notifications = Array.from(notificationDock.children);
            if (notifications.length === 0) return;

            const notification = notifications[0];
            if (notification!.classList.contains('closing')) return;
            notification!.classList.remove('opening');
            notification!.classList.add('closing');
            setTimeout(() => {
                notification!.remove();
            }, 500);
        }
    });
})
;