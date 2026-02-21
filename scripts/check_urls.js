const https = require('https');

const urls = [
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677256/hemohive_assets/inventory_sketch.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677261/hemohive_assets/inventory_colour_image.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677400/hemohive_assets/temp_RaktSeva_sketch_image.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677151/hemohive_assets/RaktSeva_color.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677249/hemohive_assets/analtyic_reports_sketch.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677083/hemohive_assets/ANalytic_reports_colour.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677146/hemohive_assets/HemoFlux_sketch_image.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677131/hemohive_assets/HemoFlux_color.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677117/hemohive_assets/Credit_and_penalty_system_sketch.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677100/hemohive_assets/Credit_and_Penality_system_colour.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677445/hemohive_assets/temp_Transaction_logs_sketch.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677201/hemohive_assets/Transaction_logs_colour.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677066/hemohive_assets/AI_Demand_sketch.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677040/hemohive_assets/AI_Demand_sketch_colour.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677179/hemohive_assets/Setting_Profile_colour.png",
    "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677190/hemohive_assets/Setting_Profile_sketch.png"
];

function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve({ url, status: res.statusCode });
        }).on('error', (e) => {
            resolve({ url, status: 'ERROR', error: e.message });
        });
    });
}

async function run() {
    const results = await Promise.all(urls.map(checkUrl));
    console.log(JSON.stringify(results, null, 2));
}

run();
