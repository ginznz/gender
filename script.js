async function convertToDocx() {
    const { PDFDocument } = PDFLib;
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    // Tạo tệp DOCX từ template
    const doc = new PizZip();
    const docxTemplate = await fetch('https://github.com/ginznz/gender/raw/refs/heads/main/Template.docx') // Tải mẫu DOCX
        .then(res => res.arrayBuffer());

    doc.load(docxTemplate);

    // Lặp qua từng file ảnh và chèn vào DOCX
    for (let i = 0; i < files.length; i++) {
        const imgFile = files[i];
        const imgUrl = URL.createObjectURL(imgFile);
        const img = await fetch(imgUrl).then(res => res.blob());
        const imgBytes = await img.arrayBuffer();

        // Lưu ảnh vào DOCX (chỉ đơn giản là thêm ảnh vào tệp docx)
        // Bạn có thể thay đổi cách ảnh được thêm vào tùy theo yêu cầu
        const base64Image = await imageToBase64(imgBytes); // Chuyển đổi ảnh thành base64 để chèn vào DOCX
        doc.file('word/media/image' + i + '.jpg', base64Image);
    }

    // Tạo tệp DOCX từ PizZip
    const content = doc.generate({ type: 'blob' });

    // Tạo liên kết tải về
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'converted.docx';
    link.click();
}

// Hàm chuyển đổi ảnh thành base64
function imageToBase64(imgBytes) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Trả về base64 của ảnh
        reader.onerror = reject;
        reader.readAsDataURL(new Blob([imgBytes]));
    });
}
async function convertToPDF() {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    // Lặp qua từng file ảnh và thêm vào PDF
    for (let i = 0; i < files.length; i++) {
        const imgFile = files[i];
        const imgUrl = URL.createObjectURL(imgFile);
        const img = await fetch(imgUrl).then(res => res.blob());
        const imgBytes = await img.arrayBuffer();

        // Kiểm tra loại ảnh và sử dụng hàm phù hợp
        let imgEmbed;
        if (imgFile.type === "image/jpeg" || imgFile.type === "image/jpg") {
            imgEmbed = await pdfDoc.embedJpg(imgBytes);
        } else if (imgFile.type === "image/png") {
            imgEmbed = await pdfDoc.embedPng(imgBytes);
        } else {
            alert("Unsupported file format: " + imgFile.type);
            continue;
        }

        // Tạo một trang mới cho mỗi ảnh và thêm ảnh vào PDF
        const page = pdfDoc.addPage([imgEmbed.width, imgEmbed.height]);
        page.drawImage(imgEmbed, { x: 0, y: 0 });
    }

    // Tạo file PDF và tạo liên kết tải về
    const pdfBytes = await pdfDoc.save();
    const downloadLink = document.getElementById('downloadLink');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.style.display = 'block'; // Hiển thị nút tải xuống
}
