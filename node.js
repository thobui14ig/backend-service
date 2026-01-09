function findVoiceSwitcherId(obj) {
    if (!obj || typeof obj !== 'object') return null;

    // Nếu gặp đúng key cần tìm
    if (obj.if_viewer_can_see_voice_switcher?.id) {
        return obj.if_viewer_can_see_voice_switcher.id;
    }

    // Duyệt sâu toàn bộ object / array
    for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'object') {
            const result = findVoiceSwitcherId(value);
            if (result) return result;
        }
    }

    return null;
}

function findVoiceSwitcherIdReel(obj) {
    if (!obj || typeof obj !== 'object') return null;

    // Nếu gặp đúng key cần tìm
    if (obj.result?.data?.video?.creation_story?.feedback?.id) {
        return obj.result?.data?.video?.creation_story?.feedback?.id;
    }

    // Duyệt sâu toàn bộ object / array
    for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'object') {
            const result = findVoiceSwitcherIdReel(value);
            if (result) return result;
        }
    }

    return null;
}

function getPostIdV1Public(html) {
    let postId = null;
    let found = false;

    // 2️⃣ Tìm tất cả <script type="application/json" data-sjs>...</script>
    const scriptBlocks = [...html.matchAll(
        /<script[^>]*type="application\/json"[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g
    )].map(m => m[1]);

    if (scriptBlocks.length === 0) {
        return null
    }


    // 3️⃣ Lặp qua từng block JSON
    for (const block of scriptBlocks) {
        if (found) break; // dừng nếu đã có đủ dữ liệu
        try {
            const json = JSON.parse(block);

            if (json.require) {
                for (const item of json.require) {
                    if (found) break;
                    const dataArray = item[3];
                    if (!Array.isArray(dataArray)) continue;

                    for (const obj of dataArray) {
                        const feedbackId = findVoiceSwitcherId(obj);
                        if (feedbackId) {
                            postId= (Buffer.from(feedbackId, 'base64').toString('utf8')).split(":")[1];
                            found = true;
                            break;
                        }
                        const reelId = findVoiceSwitcherIdReel(obj);
                        if (reelId) {
                            postId= (Buffer.from(reelId, 'base64').toString('utf8')).split(":")[1];
                            found = true;
                            break;
                        }
                    }
                }
            }
        } catch (err) {
            
        }
    }

    return postId
} 

const fs = require('fs');

const html = fs.readFileSync('a.html', 'utf8');
const res = getPostIdV1Public(html)
console.log(res);


