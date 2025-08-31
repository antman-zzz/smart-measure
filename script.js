document.addEventListener('DOMContentLoaded', () => {
    const calibrationSlider = document.getElementById('calibration-slider');
    const calibrationBar = document.getElementById('calibration-bar');
    const saveCalibrationBtn = document.getElementById('save-calibration');
    const ruler = document.getElementById('ruler');
    const addBtn = document.getElementById('add-btn');
    const resetBtn = document.getElementById('reset-btn');
    const measurementValueEl = document.getElementById('measurement-value');
    const unitBtns = document.querySelectorAll('.unit-btn');
    const calibrationBtn = document.getElementById('calibration-btn');
    const calibrationSidebar = document.getElementById('calibration-sidebar');

    const CARD_HEIGHT_CM = 8.56;
    const RULER_LENGTH_CM = 11; // 10cm + 上下5mmずつの余裕

    let pixelsPerCm = 50; // デフォルト値
    let counter = 0;
    let currentUnit = 'cm';

    // --- キャリブレーション ---
    function updateCalibrationBar() {
        calibrationBar.style.height = `${calibrationSlider.value}px`;
    }

    function saveCalibration() {
        const barHeightPx = calibrationSlider.value;
        pixelsPerCm = barHeightPx / CARD_HEIGHT_CM;
        localStorage.setItem('pixelsPerCm', pixelsPerCm);
        alert(`キャリブレーションを保存しました。
1cm = ${pixelsPerCm.toFixed(2)}ピクセル`);
        drawRuler();
        calibrationSidebar.classList.remove('visible'); // 保存後にサイドバーを閉じる
    }

    function loadCalibration() {
        const savedPixelsPerCm = localStorage.getItem('pixelsPerCm');
        if (savedPixelsPerCm) {
            pixelsPerCm = parseFloat(savedPixelsPerCm);
        }
        // スライダーの初期値を保存値から逆算（概算）
        calibrationSlider.value = pixelsPerCm * CARD_HEIGHT_CM;
        updateCalibrationBar();
    }

    // --- 定規の描画 ---
    function drawRuler() {
        ruler.innerHTML = ''; // 目盛りをリセット

        // 定規全体の物理的な高さ (11cm分)
        const rulerHeight = RULER_LENGTH_CM * pixelsPerCm;
        ruler.style.height = `${rulerHeight}px`;

        // 0cmの目盛りが定規の物理的な下端から0.5cm上にくるようにオフセット
        const offsetPx = 0.5 * pixelsPerCm;

        // -5mmから10.5cmまでの目盛り線を描画
        for (let i = -5; i <= 105; i++) {
            const mark = document.createElement('div');
            mark.classList.add('mark');

            // 目盛りの位置を計算 (物理的な下端からのオフセット + 目盛りの位置)
            const bottomPosition = (i / 10) * pixelsPerCm + offsetPx;
            mark.style.bottom = `${bottomPosition}px`;

            if (i % 10 === 0) { // 1cmごとの目盛り
                mark.classList.add('cm');
                if (i === 0 || i === 100) { // 0cmと10cmの目盛りを太くする
                    mark.classList.add('mark-bold');
                }
                // 0cmから10cmの目盛りのみ数字を表示
                if (i >= 0 && i <= 100) {
                    const label = document.createElement('span');
                    label.classList.add('mark-label');
                    label.textContent = (i / 10).toFixed(0); // 整数表示 (0, 1, ..., 10)
                    label.style.bottom = `${bottomPosition - 10}px`; // ラベルの位置を若干上に調整
                    ruler.appendChild(label);
                }
            } else if (i % 5 === 0) { // 5mmごとの目盛り
                 mark.classList.add('mm-5');
            }
            else { // 1mmごとの目盛り
                mark.classList.add('mm');
            }
            ruler.appendChild(mark);
        }
    }

    // --- カウンターと測定 ---
    function updateCounterDisplay() {
        // counterValueEl.textContent = counter; // カウント表示は削除されたためコメントアウト
        updateMeasurement();
    }

    function updateMeasurement() {
        const totalCm = counter * 10; // 10cm単位でカウント
        let displayValue;

        switch (currentUnit) {
            case 'cm':
                displayValue = totalCm.toFixed(1);
                break;
            case 'mm':
                displayValue = (totalCm * 10).toFixed(0);
                break;
            case 'inch':
                displayValue = (totalCm / 2.54).toFixed(2);
                break;
        }
        measurementValueEl.textContent = `${displayValue} ${currentUnit}`;
    }

    function changeUnit(newUnit) {
        currentUnit = newUnit;
        unitBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === newUnit);
        });
        updateMeasurement();
    }

    // --- イベントリスナー ---
    calibrationSlider.addEventListener('input', updateCalibrationBar);
    saveCalibrationBtn.addEventListener('click', saveCalibration);

    calibrationBtn.addEventListener('click', () => {
        calibrationSidebar.classList.add('visible');
    });

    addBtn.addEventListener('click', () => {
        counter++;
        updateCounterDisplay();
    });

    resetBtn.addEventListener('click', () => {
        counter = 0;
        updateCounterDisplay();
    });

    unitBtns.forEach(btn => {
        btn.addEventListener('click', (event) => changeUnit(event.target.dataset.unit));
    });

    // --- 初期化 ---
    loadCalibration();
    drawRuler();
    updateCounterDisplay();
});
