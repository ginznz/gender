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
