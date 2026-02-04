import { GradeScale, GradeScaleDetail } from '../models/index.js';

/**
 * Seed Grade Scales for Legacy and OBE grading systems
 */
export const seedGradeScales = async () => {
    try {
        console.log('🌱 Seeding Grade Scales...');

        // ========== LEGACY SCALE ==========
        const legacyScale = await GradeScale.findOrCreate({
            where: { name: 'Legacy Scale' },
            defaults: {
                name: 'Legacy Scale',
                description: 'Traditional grading scale (A=81-100, IP=4.0)',
                is_active: true
            }
        });

        if (legacyScale[1]) {
            // Created new, add details
            await GradeScaleDetail.bulkCreate([
                { grade_scale_id: legacyScale[0].id, huruf: 'A', min_angka: 81, max_angka: 100, ip: 4.0, sort_order: 1 },
                { grade_scale_id: legacyScale[0].id, huruf: 'B', min_angka: 69, max_angka: 80, ip: 3.0, sort_order: 2 },
                { grade_scale_id: legacyScale[0].id, huruf: 'C', min_angka: 50, max_angka: 68, ip: 2.0, sort_order: 3 },
                { grade_scale_id: legacyScale[0].id, huruf: 'D', min_angka: 41, max_angka: 49, ip: 1.0, sort_order: 4 },
                { grade_scale_id: legacyScale[0].id, huruf: 'E', min_angka: 0, max_angka: 40, ip: 0.0, sort_order: 5 }
            ]);
            console.log('✅ Legacy Scale created with 5 grades');
        } else {
            console.log('ℹ️  Legacy Scale already exists');
        }

        // ========== OBE SCALE (NEW) ==========
        const obeScale = await GradeScale.findOrCreate({
            where: { name: 'OBE Scale' },
            defaults: {
                name: 'OBE Scale',
                description: 'Outcome-Based Education grading scale (A=86-90, IP=3.75)',
                is_active: true
            }
        });

        if (obeScale[1]) {
            // Created new, add details
            await GradeScaleDetail.bulkCreate([
                { grade_scale_id: obeScale[0].id, huruf: 'A', min_angka: 86, max_angka: 90, ip: 3.75, sort_order: 1 },
                { grade_scale_id: obeScale[0].id, huruf: 'A-', min_angka: 80, max_angka: 85, ip: 3.5, sort_order: 2 },
                { grade_scale_id: obeScale[0].id, huruf: 'B+', min_angka: 76, max_angka: 79, ip: 3.25, sort_order: 3 },
                { grade_scale_id: obeScale[0].id, huruf: 'B', min_angka: 73, max_angka: 75, ip: 3.0, sort_order: 4 },
                { grade_scale_id: obeScale[0].id, huruf: 'B-', min_angka: 66, max_angka: 72, ip: 2.75, sort_order: 5 },
                { grade_scale_id: obeScale[0].id, huruf: 'C+', min_angka: 61, max_angka: 65, ip: 2.5, sort_order: 6 },
                { grade_scale_id: obeScale[0].id, huruf: 'C', min_angka: 51, max_angka: 60, ip: 2.0, sort_order: 7 },
                { grade_scale_id: obeScale[0].id, huruf: 'D', min_angka: 41, max_angka: 50, ip: 1.0, sort_order: 8 },
                { grade_scale_id: obeScale[0].id, huruf: 'E', min_angka: 0, max_angka: 40, ip: 0.0, sort_order: 9 }
            ]);
            console.log('✅ OBE Scale created with 9 grades');
        } else {
            console.log('ℹ️  OBE Scale already exists');
        }

        console.log('✅ Grade Scales seeding completed!');
        return { legacyScale: legacyScale[0], obeScale: obeScale[0] };
    } catch (error) {
        console.error('❌ Error seeding grade scales:', error);
        throw error;
    }
};

export default seedGradeScales;
