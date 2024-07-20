const navTemplate = document.createElement('template');

navTemplate.innerHTML = `
    <style>
        @import url("../css/output.css");
    </style>
    <nav class="w-full py-4 bg-black shadow">
        <div class="w-full container mx-auto flex flex-wrap items-center justify-between">
            <nav>
                <ul class="flex items-center justify-between font-bold text-sm text-white uppercase no-underline">
                    <li><a href="/index.html" class="uppercase px-3">home</a></li>
                    <li><a href="#" class="uppercase px-3">code</a></li>
                    <li><a onmousedown="playClip()" href="#" class="uppercase px-3">music</a></li>
                    <li><a href="/gallery.html" class="uppercase px-3">gallery</a></li>
                </ul>
            </nav>
            <div class="flex items-center text-lg no-underline text-white pr-6">
                <a class="" href="https://github.com/linomp" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25"
                        viewBox="0,0,256,256">
                        <g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt"
                            stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0"
                            font-family="none" font-weight="none" font-size="none" text-anchor="none"
                            style="mix-blend-mode: normal">
                            <g transform="scale(5.33333,5.33333)">
                                <path
                                    d="M44,24c0,8.96 -5.88,16.54 -14,19.08v-5.08c0,-1.71 -0.72,-3.24 -1.86,-4.34c5.24,-0.95 7.86,-4 7.86,-9.66c0,-2.45 -0.5,-4.39 -1.48,-5.9c0.44,-1.71 0.7,-4.14 -0.52,-6.1c-2.36,0 -4.01,1.39 -4.98,2.53c-1.45,-0.35 -3.12,-0.53 -5.02,-0.53c-1.8,0 -3.46,0.2 -4.94,0.61c-0.96,-1.15 -2.64,-2.61 -5.06,-2.61c-1.42,2.28 -0.84,4.74 -0.3,6.12c-1.08,1.51 -1.7,3.45 -1.7,5.88c0,5.66 2.62,8.71 7.86,9.66c-0.67,0.65 -1.19,1.44 -1.51,2.34h-2.35c-1.44,0 -2,-0.64 -2.77,-1.68c-0.77,-1.04 -1.6,-1.74 -2.59,-2.03c-0.53,-0.06 -0.89,0.37 -0.42,0.75c1.57,1.13 1.68,2.98 2.31,4.19c0.57,1.09 1.75,1.77 3.08,1.77h2.39v4.08c-8.12,-2.54 -14,-10.12 -14,-19.08c0,-11.05 8.95,-20 20,-20c11.05,0 20,8.95 20,20z">
                                </path>
                            </g>
                        </g>
                    </svg>
                </a>
                <a class="pl-6" href="https://www.linkedin.com/in/lino-mp/" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25"
                        viewBox="0,0,256,256">
                        <g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt"
                            stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0"
                            font-family="none" font-weight="none" font-size="none" text-anchor="none"
                            style="mix-blend-mode: normal">
                            <g transform="scale(8.53333,8.53333)">
                                <path
                                    d="M24,4h-18c-1.105,0 -2,0.895 -2,2v18c0,1.105 0.895,2 2,2h18c1.105,0 2,-0.895 2,-2v-18c0,-1.105 -0.895,-2 -2,-2zM10.954,22h-2.95v-9.492h2.95zM9.449,11.151c-0.951,0 -1.72,-0.771 -1.72,-1.72c0,-0.949 0.77,-1.719 1.72,-1.719c0.948,0 1.719,0.771 1.719,1.719c0,0.949 -0.771,1.72 -1.719,1.72zM22.004,22h-2.948v-4.616c0,-1.101 -0.02,-2.517 -1.533,-2.517c-1.535,0 -1.771,1.199 -1.771,2.437v4.696h-2.948v-9.492h2.83v1.297h0.04c0.394,-0.746 1.356,-1.533 2.791,-1.533c2.987,0 3.539,1.966 3.539,4.522z">
                                </path>
                            </g>
                        </g>
                    </svg>
                </a>
            </div>
        </div>
    </nav>
`;

class Nav extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'closed' });
        shadowRoot.appendChild(navTemplate.content.cloneNode(true));
    }
}

customElements.define('nav-component', Nav);
