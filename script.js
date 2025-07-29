async function convertToDocx() {
    const { PDFDocument } = PDFLib;
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    // URL API GitHub để lấy tệp DOCX từ kho lưu trữ
    const githubApiUrl = 'https://api.github.com/repos/ginznz/gender/contents/Template.docx';

    // Gửi yêu cầu tới GitHub API để lấy tệp
    const response = await fetch(githubApiUrl);
    const data = await response.json();

    // Dữ liệu trả về từ GitHub API chứa nội dung tệp được mã hóa base64
    const docxTemplate = atob(data.content);  // Giải mã base64

    const doc = new PizZip();
    const uint8Array = new Uint8Array(docxTemplate.length);

    // Chuyển chuỗi base64 thành mảng Uint8Array
    for (let i = 0; i < docxTemplate.length; i++) {
        uint8Array[i] = docxTemplate.charCodeAt(i);
    }

    doc.load(uint8Array);

    // Lặp qua từng file ảnh và chèn vào DOCX
    for (let i = 0; i < files.length; i++) {
        const imgFile = files[i];
        const imgUrl = URL.createObjectURL(imgFile);
        const img = await fetch(imgUrl).then(res => res.blob());
        const imgBytes = await img.arrayBuffer();

        // Chuyển đổi ảnh thành base64
        const base64Image = await imageToBase64(imgBytes); // Chuyển ảnh thành base64
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
