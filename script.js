// Fungsi untuk membuka link WhatsApp
function openWhatsAppLink(tanggal) {
  // Pastikan nomor menggunakan kode negara (62) dan bukan 0 di depan.
  const nomorAdmin = "628158000598";

  const pesanTemplate = `aku mau reservasi ujian di tanggal ini ${tanggal} lokasi (di isi manual sama kandidat) apakah masih tersedia`;

  // Mengubah pesan menjadi format URL yang aman
  const encodedPesan = encodeURIComponent(pesanTemplate);

  const url = `https://api.whatsapp.com/send?phone=${nomorAdmin}&text=${encodedPesan}`;

  // Membuka link di tab baru
  window.open(url, "_blank");
}

// Inisialisasi kalender
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

// Fungsi untuk scroll ke kalender
function scrollKeKalender() {
  const kalender = document.getElementById("bagian-kalender");
  if (kalender) {
    kalender.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Variabel untuk menandai apakah sudah memilih jenis ujian
let sudahPilihJenisUjian = false;

// Generate calendar when page loads
window.onload = function () {
  generateCalendar(currentMonth, currentYear);

  // Event listeners dengan kondisi scroll
  document.getElementById("city").addEventListener("change", function () {
    generateCalendar(currentMonth, currentYear);
    if (sudahPilihJenisUjian) {
      setTimeout(scrollKeKalender, 100);
    }
  });

  document.getElementById("exam-type").addEventListener("change", function () {
    generateCalendar(currentMonth, currentYear);
    // Set flag bahwa sudah memilih jenis ujian
    sudahPilihJenisUjian = this.value !== "all";

    if (sudahPilihJenisUjian) {
      setTimeout(scrollKeKalender, 100);
    }
  });

  document.querySelector(".prev-month").addEventListener("click", function () {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
  });

  document.querySelector(".next-month").addEventListener("click", function () {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
  });
};

function generateCalendar(month, year) {
  const cityFilter = document.getElementById("city").value;
  const examTypeFilter = document.getElementById("exam-type").value;

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  document.getElementById("month-year").textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = firstDay.getDay();

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  let calendarHtml = '<table class="calendar"><tr>';
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  for (let i = 0; i < 7; i++) {
    calendarHtml += `<th>${dayNames[i]}</th>`;
  }
  calendarHtml += "</tr>";

  let date = 1;
  let hasExams = false;

  for (let i = 0; i < 6; i++) {
    calendarHtml += "<tr>";

    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startingDay) {
        const prevMonthDays = new Date(year, month, 0).getDate();
        const prevDate = prevMonthDays - (startingDay - j - 1);
        calendarHtml += `<td class="other-month"><div class="date-number">${prevDate}</div></td>`;
      } else if (date > daysInMonth) {
        const nextDate = date - daysInMonth;
        calendarHtml += `<td class="other-month"><div class="date-number">${nextDate}</div></td>`;
        date++;
      } else {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
        const isToday = isCurrentMonth && date === today.getDate();

        const examsToday = examData.filter((exam) => {
          if (exam.date !== dateStr) return false;
          if (cityFilter !== "all" && exam.city !== cityFilter) return false;
          return true;
        });

        if (examsToday.length > 0) hasExams = true;

        let examIndicators = "";
        if (examTypeFilter === "all") {
          const hasJFT = examsToday.some((exam) => exam.type === "jft");
          const hasSSW = examsToday.some((exam) => exam.type === "ssw");

          if (hasJFT && hasSSW) {
            examIndicators = `<div class="exam-indicator-container"><div class="exam-indicator exam-jft"></div><div class="exam-indicator exam-ssw"></div></div>`;
          } else if (hasJFT) {
            examIndicators = `<div class="exam-indicator exam-jft" style="left: 50%; transform: translateX(-50%);"></div>`;
          } else if (hasSSW) {
            examIndicators = `<div class="exam-indicator exam-ssw" style="left: 50%; transform: translateX(-50%);"></div>`;
          }
        } else {
          examsToday.forEach((exam) => {
            if (exam.type === examTypeFilter) {
              examIndicators += `<div class="exam-indicator exam-${exam.type}" style="left: 50%; transform: translateX(-50%);"></div>`;
            }
          });
        }

        let tdClass = isToday ? "today" : "";
        let tdOnclick = "";

        if (examsToday.length > 0) {
          tdClass += " has-exam";
          const tanggalPesan = `${date} ${monthNames[month]} ${year}`;
          tdOnclick = `onclick="openWhatsAppLink('${tanggalPesan}')"`;
        }

        calendarHtml += `<td class="${tdClass}" ${tdOnclick}>
                      <div class="date-number">${date}</div>
                      ${examIndicators}
                  </td>`;

        date++;
      }
    }

    calendarHtml += "</tr>";
    if (date > daysInMonth) break;
  }

  calendarHtml += "</table>";

  if (!hasExams) {
    calendarHtml = `<div class="no-exams">Tidak ada ujian yang sesuai dengan filter yang dipilih</div>`;
  }

  const calendarWrapper = document.getElementById("calendar-wrapper");
  calendarWrapper.innerHTML = calendarHtml;

  if (hasExams) {
    const watermark = document.createElement("div");
    watermark.className = "calendar-watermark";
    watermark.textContent = "Reservasi Ujian 08973242070";
    calendarWrapper.appendChild(watermark);
  }
}

/* ========== Mulai: Logika untuk Popup Reservasi ========== */
document.addEventListener("DOMContentLoaded", function () {
  // Ambil elemen-elemen popup dari HTML
  const popupOverlay = document.getElementById("reservasi-popup");
  const popupCloseButton = popupOverlay.querySelector(".popup-close");

  // Fungsi untuk menampilkan popup
  const showPopup = () => {
    popupOverlay.classList.add("show");
  };

  // Fungsi untuk menyembunyikan popup
  const hidePopup = () => {
    popupOverlay.classList.remove("show");
  };

  // Tampilkan popup setelah 3 detik halaman dimuat
  // Anda bisa ganti angka 3000 (3 detik) sesuai keinginan
  setTimeout(showPopup, 3000);

  // Event listener untuk tombol close (X)
  popupCloseButton.addEventListener("click", hidePopup);

  // Event listener untuk menutup popup saat mengklik area gelap di luar
  popupOverlay.addEventListener("click", function (event) {
    // Pastikan yang diklik adalah area overlay, bukan konten popup itu sendiri
    if (event.target === popupOverlay) {
      hidePopup();
    }
  });
});
/* ========== Selesai: Logika untuk Popup Reservasi ========== */
