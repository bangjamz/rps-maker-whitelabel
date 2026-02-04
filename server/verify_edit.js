const API_URL = 'http://localhost:5001/api';

const verify = async () => {
    try {
        // Helper for fetch
        const post = async (url, body, token) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || res.statusText);
            }
            return data;
        };

        const get = async (url, token) => {
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, { headers });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || res.statusText);
            return data;
        };

        const put = async (url, body, token) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || res.statusText);
            return data;
        };

        // 1. Login as Kaprodi
        console.log('Logging in as Kaprodi...');
        const kaprodiData = await post(`${API_URL}/auth/login`, {
            username: 'kaprodi_informatika',
            password: 'password123'
        });
        const kaprodiToken = kaprodiData.token;
        console.log('Kaprodi logged in.');

        // 2. Login as Dosen (Owner)
        console.log('Logging in as Dosen Andi...');
        const dosenData = await post(`${API_URL}/auth/login`, {
            username: 'dosen_andi',
            password: 'password123'
        });
        const dosenToken = dosenData.token;
        console.log('Dosen logged in.');

        // 3. Get an RPS to edit
        const courses = await get(`${API_URL}/rps/dosen/my-courses`, dosenToken);
        if (courses.length === 0) {
            console.log('No courses found for Dosen Andi. Cannot proceed.');
            return;
        }
        const courseId = courses[0].id;
        console.log(`Using Course ID: ${courseId}`);

        let rpsId;
        try {
            console.log('Creating RPS as Dosen...');
            const createRes = await post(`${API_URL}/rps/dosen/create`, {
                mata_kuliah_id: courseId,
                semester: 'Ganjil',
                tahun_ajaran: '2025/2026',
                deskripsi_mk: 'Original Description'
            }, dosenToken);
            rpsId = createRes.rps.id;
            console.log(`RPS Created. ID: ${rpsId}`);
        } catch (e) {
            console.log('RPS creation failed with error:', e.message);
            // try matching courseId to RPS via DB
            try {
                const { RPS } = await import('./models/index.js');
                const rps = await RPS.findOne({ where: { mata_kuliah_id: courseId } });
                if (rps) {
                    rpsId = rps.id;
                    console.log(`Found existing RPS ID via DB: ${rpsId}`);
                } else {
                    console.log('DB Lookup returned null for this courseId.');
                }
            } catch (err) {
                console.log('Model import or query failed', err);
            }
        }

        if (!rpsId) {
            console.log('Could not get RPS ID. Aborting.');
            return;
        }

        // 4. Try to update as Kaprodi
        console.log(`Attempting to update RPS ${rpsId} as Kaprodi...`);
        try {
            await put(`${API_URL}/rps/dosen/${rpsId}/update`, {
                deskripsi_mk: 'Updated by Kaprodi ' + new Date().toISOString()
            }, kaprodiToken);
            console.log('SUCCESS: Kaprodi updated RPS!');
        } catch (error) {
            console.error('FAILURE: Kaprodi update failed:', error.message);
        }

    } catch (error) {
        console.log('Full Verification Error:', error);
    }
};

verify();
