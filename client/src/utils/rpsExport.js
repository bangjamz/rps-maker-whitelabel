import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportRPSToPDF = async (course, rpsData) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add logo
    try {
        const logoImg = await loadImage('/logo-mahardika.jpg');
        doc.addImage(logoImg, 'JPEG', 15, 10, 20, 20);
    } catch (error) {
        console.warn('Logo not loaded:', error);
    }

    // Header text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RENCANA PEMBELAJARAN SEMESTER', pageWidth / 2, 15, { align: 'center' });
    doc.text('PROGRAM STUDI S1 INFORMATIKA', pageWidth / 2, 21, { align: 'center' });
    doc.setFontSize(10);
    doc.text('FAKULTAS TEKNIK', pageWidth / 2, 27, { align: 'center' });
    doc.text('INSTITUT TEKNOLOGI DAN KESEHATAN MAHARDIKA', pageWidth / 2, 32, { align: 'center' });

    let yPos = 40;

    // Identitas MK
    doc.autoTable({
        startY: yPos,
        head: [[{ content: 'Identitas Mata Kuliah', colSpan: 4, styles: { halign: 'center', fillColor: [200, 200, 200] } }]],
        body: [
            ['Nama MK', course?.nama_mk || '-', 'Kode MK', course?.kode_mk || '-'],
            ['SKS', `${course?.sks || 0}`, 'Semester', `${course?.semester || '-'}`],
        ],
        theme: 'grid',
        styles: { fontSize: 9 },
    });

    yPos = doc.lastAutoTable.finalY + 5;

    // CPL
    if (rpsData?.cpl?.length > 0) {
        doc.autoTable({
            startY: yPos,
            head: [['Kode CPL', 'Deskripsi']],
            body: rpsData.cpl.map(cpl => [cpl.kode_cpl, cpl.deskripsi]),
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [100, 100, 100] },
        });
        yPos = doc.lastAutoTable.finalY + 5;
    }

    // CPMK
    if (rpsData?.cpmk?.length > 0) {
        doc.autoTable({
            startY: yPos,
            head: [['Kode CPMK', 'Deskripsi']],
            body: rpsData.cpmk.map(cpmk => [cpmk.kode_cpmk, cpmk.deskripsi]),
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [100, 100, 100] },
        });
        yPos = doc.lastAutoTable.finalY + 5;
    }

    // Weekly schedule
    doc.addPage();
    doc.autoTable({
        startY: 15,
        head: [['Minggu', 'CPMK', 'Materi', 'Metode', 'Bobot']],
        body: Array.from({ length: 15 }, (_, i) => {
            const week = i + 1;
            return [
                week,
                week === 8 ? 'UTS' : week === 15 ? 'UAS' : '-',
                week === 8 ? 'Ujian Tengah Semester' : week === 15 ? 'Ujian Akhir Semester' : '-',
                '-',
                week === 8 ? '22%' : week === 15 ? '26%' : week <= 7 ? '4%' : '-'
            ];
        }),
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [100, 100, 100] },
    });

    // Save
    doc.save(`RPS_${course?.kode_mk || 'document'}_${Date.now()}.pdf`);
};

// Helper to load image
const loadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
};
