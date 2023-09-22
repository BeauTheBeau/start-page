// Get quick links from local storage
function getQuickLinks() {
    if (localStorage.getItem("quickLinks") === null) return [];
    else return JSON.parse(localStorage.getItem("quickLinks"));
}

let quickLinks = getQuickLinks();

/**
 * @name addQuickLink
 * @description Adds a quick link to the quick links array and saves it to local storage.
 * @param {String} quickLink - The quick link to add.
 * @param {String} quickLink.name - The name of the quick link.
 * @param {String} quickLink.url - The URL of the quick link.
 * @param {String} quickLink.icon - The icon of the quick link.
 * @returns {undefined}
 */

function addQuickLink(quickLink) {
    quickLinks.push(quickLink);
    localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
}

/**
 * @name removeQuickLink
 * @description Removes a quick link from the quick links array and saves it to local storage.
 * @param {String} quickLink - The quick link to remove.
 * @param {String} quickLink.name - The name of the quick link.
 * @param {String} quickLink.url - The URL of the quick link.
 * @param {String} quickLink.icon - The icon of the quick link.
 */

function removeQuickLink(quickLink) {
    quickLinks = quickLinks.filter((link) => link.name !== quickLink.name);
    localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
}

/**
 * @name clearAllQuickLinks
 * @description Clears all quick links from the quick links array and saves it to local storage.
 * @returns {undefined}
 */

function clearAllQuickLinks() {
    quickLinks = [];
    localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
}

/**
 * @name renderQuickLinks
 * @description Renders the quick links to the DOM.
 * @returns {undefined}
 */

function renderQuickLinks() {
    const quickLinksElement = document.querySelector("#quick-links");
    quickLinksElement.innerHTML = "";

    quickLinks.forEach((quickLink) => {
        const quickLinkElement = document.createElement("a");
        quickLinkElement.classList.add("quick-link");
        quickLinkElement.href = quickLink.url;
        quickLinkElement.innerHTML = `
      <div class="quick-link-icon"><i class="nf ${quickLink.icon}"></i></div>
      <div class="quick-link-name">${quickLink.name}</div>
    `;
        quickLinksElement.appendChild(quickLinkElement);
    });
}

addQuickLink({ name: "Google", url: "https://google.com", icon: "nf-fa-google" });
addQuickLink({ name: "YouTube", url: "https://youtube.com", icon: "nf-md-youtube" });
addQuickLink({ name: "GitHub", url: "https://github.com", icon: "nf-md-github" });
addQuickLink({ name: "Reddit", url: "https://reddit.com", icon: "nf-md-reddit" });
addQuickLink({ name: "Twitter", url: "https://twitter.com", icon: "nf-md-twitter" });

renderQuickLinks();
clearAllQuickLinks();
