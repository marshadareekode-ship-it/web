/**
 * Google Sheets Integration Module
 * for MAJMA'A PUBLIC SCHOOL
 * 
 * =========================================================================
 * IMPLEMENTATION INSTRUCTIONS
 * =========================================================================
 * 
 * Data is dynamically fetched from the main Google Sheet using PapaParse.
 * Published CSV export links are used to skip API Key requirements.
 * 
 * - News corresponds to the GID 0
 * - Announcements corresponds to GID 1096007158
 * - Gallery corresponds to GID 845142079
 */

const GoogleSheetsConfig = {
    // ---------------------------------------------------------------------------
    // Connection URLs to the attached Google Sheet
    // ---------------------------------------------------------------------------
    urls: {
        news: 'https://docs.google.com/spreadsheets/d/1l9lynM9bUzmwloKeFJLJ5Hy5kehzVnz-vINKJzbAAF4/gviz/tq?tqx=out:csv&gid=0',
        announcements: 'https://docs.google.com/spreadsheets/d/1l9lynM9bUzmwloKeFJLJ5Hy5kehzVnz-vINKJzbAAF4/gviz/tq?tqx=out:csv&gid=0',
        gallery: 'https://docs.google.com/spreadsheets/d/1l9lynM9bUzmwloKeFJLJ5Hy5kehzVnz-vINKJzbAAF4/gviz/tq?tqx=out:csv&gid=845142079'
    }
};

/**
 * Fetches and processes data from the given CSV URL.
 */
function fetchSheetData(url, containerId, rendererFunction) {
    const container = document.getElementById(containerId);
    if (!container) return; // Only process if the container exists in DOM

    // Save existing static HTML so we don't overwrite photos already hardcoded in index.html
    const originalHTML = container.innerHTML;

    // Add a loader that we'll remove later
    const loaderHTML = `<div id="${containerId}-loader" class="text-center p-3 w-100"><i class="fa-solid fa-spinner fa-spin text-gold" style="font-size: 2rem;"></i><p class="mt-2 text-muted">Loading data...</p></div>`;
    container.innerHTML = originalHTML + loaderHTML;

    Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Clean up header keys which may have trailing spaces in Google Sheets
            const data = results.data.map(row => {
                const cleanedRow = {};
                for (const key in row) {
                    cleanedRow[key.trim().toLowerCase()] = row[key];
                }
                return cleanedRow;
            });
            
            // Remove the loader and append data
            container.innerHTML = originalHTML + rendererFunction(data);
        },
        error: function(err) {
            console.error('Error fetching sheet data:', err);
            container.innerHTML = originalHTML + '<p class="text-danger w-100 text-center">Failed to load live data.</p>';
        }
    });
}

// ---------------------------------------------------------
// Renderers
// ---------------------------------------------------------
function renderNewsList(data) {
    // Filter to ensure we have actual title content
    const validData = data.filter(item => item['latest news'] || item.titles || item.title || item.contents || item.content);
    if (!validData || validData.length === 0) return '<p class="text-muted">No news available.</p>';

    return validData.map(item => {
        const mainText = item['latest news'] || item.titles || item.title;
        const subText = item.contents || item.content;
        
        let html = '<div class="news-item p-3 mb-3 bg-white rounded shadow-sm border-start border-4" style="border-left-color: var(--primary-blue) !important;">';
        
        if (item.date) {
            html += `<span class="news-date d-block mb-2"><i class="fa-regular fa-calendar" style="color: var(--primary-gold);"></i> ${item.date}</span>`;
        }
        
        if (mainText) {
            html += `<h4 class="mt-1 mb-1" style="font-size: 1.1rem;">${mainText}</h4>`;
        } else if (subText) {
            html += `<h4 class="mt-1 mb-1" style="font-size: 1.1rem;">${subText}</h4>`;
        }
        
        if (mainText && subText) {
            html += `<p class="text-muted mb-0 mt-2">${subText}</p>`;
        }
        
        html += '</div>';
        return html;
    }).join('');
}

function renderAnnouncementsList(data) {
    const validData = data.filter(item => item['notice board'] || Object.values(item).some(v => v));
    if (!validData || validData.length === 0) return '<p class="text-muted">No announcements.</p>';

    return validData.map(item => {
        // Look for notice board column or fallback to checking the object properties
        const content = item['notice board'] || item.announcements || item.announcement || item.alert || '';
        if (!content) return '';
        
        return `
        <div class="announcement-item bg-light p-3 mb-3 rounded border-start border-4" style="border-left-color: var(--primary-gold) !important;">
            <div class="d-flex align-items-start gap-3">
                <i class="fa-solid fa-bell text-gold mt-1"></i>
                <div>
                    <p class="mb-0 fw-500">${content}</p>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderGalleryList(data) {
    const validData = data.filter(item => item.image_url || item.image || item.url || item.link);
    if (!validData || validData.length === 0) return ''; // Return empty so it just appends nothing

    return validData.map(item => {
        let url = item.image_url || item.image || item.url || item.link;
        // Transform Google Drive links to direct embed links
        if (url.includes('drive.google.com/file/d/')) {
            const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
        }
        
        const alt = item.alt_text || item.alt || item.description || 'Gallery Image';
        return `
        <div class="gallery-item">
            <img src="${url}" alt="${alt}" loading="lazy" onerror="this.src='images/placeholder.jpg'; this.onerror=null;">
        </div>
        `;
    }).join('');
}

// Initialize components once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Automatically fetch and inject data for all sections
    fetchSheetData(GoogleSheetsConfig.urls.news, 'news-container', renderNewsList);
    fetchSheetData(GoogleSheetsConfig.urls.announcements, 'announcements-container', renderAnnouncementsList);
    fetchSheetData(GoogleSheetsConfig.urls.gallery, 'gallery-container', renderGalleryList);
});
