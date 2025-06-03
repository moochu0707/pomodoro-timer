document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const timeDisplay = document.getElementById('time');
    const statusDisplay = document.getElementById('status');
    const startButton = document.getElementById('start');
    const pauseButton = document.getElementById('pause');
    const resetButton = document.getElementById('reset');
    const workTimeInput = document.getElementById('workTime');
    const breakTimeInput = document.getElementById('breakTime');
    const sessionsDisplay = document.getElementById('sessions');
    const container = document.querySelector('.container');

    // タイマーの状態
    let timer;
    let isRunning = false;
    let isPaused = false;
    let isWorkTime = true;
    let timeLeft = workTimeInput.value * 60;
    let completedSessions = 0;

    // 音声通知の設定
    const workCompleteSound = new Audio('https://soundbible.com/grab.php?id=1746&type=mp3'); // ベル音
    const breakCompleteSound = new Audio('https://soundbible.com/grab.php?id=1683&type=mp3'); // チャイム音

    // タイマーの表示を更新する関数
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // タイトルも更新（ブラウザタブに表示される）
        document.title = `${timeDisplay.textContent} - ${isWorkTime ? '作業中' : '休憩中'}`;
    }

    // タイマーをスタートする関数
    function startTimer() {
        if (isRunning && !isPaused) return;
        
        // 一時停止からの再開
        if (isPaused) {
            isPaused = false;
            isRunning = true;
        } else {
            // 新しくタイマーを開始
            isRunning = true;
            if (isWorkTime) {
                timeLeft = workTimeInput.value * 60;
                statusDisplay.textContent = '作業時間';
                container.classList.add('work-mode');
                container.classList.remove('break-mode');
            } else {
                timeLeft = breakTimeInput.value * 60;
                statusDisplay.textContent = '休憩時間';
                container.classList.add('break-mode');
                container.classList.remove('work-mode');
            }
        }
        
        updateDisplay();
        
        // タイマーの実行
        timer = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            // タイマーが0になった場合
            if (timeLeft <= 0) {
                clearInterval(timer);
                
                if (isWorkTime) {
                    // 作業時間が終了
                    workCompleteSound.play();
                    completedSessions++;
                    sessionsDisplay.textContent = completedSessions;
                    isWorkTime = false;
                    
                    // 通知を表示（ブラウザが許可している場合）
                    if (Notification.permission === 'granted') {
                        new Notification('作業時間が終了しました', {
                            body: '休憩しましょう！',
                            icon: 'https://via.placeholder.com/64'
                        });
                    }
                } else {
                    // 休憩時間が終了
                    breakCompleteSound.play();
                    isWorkTime = true;
                    
                    // 通知を表示（ブラウザが許可している場合）
                    if (Notification.permission === 'granted') {
                        new Notification('休憩時間が終了しました', {
                            body: '作業を始めましょう！',
                            icon: 'https://via.placeholder.com/64'
                        });
                    }
                }
                
                // 次のセッションを自動的に開始
                startTimer();
            }
        }, 1000);
    }

    // タイマーを一時停止する関数
    function pauseTimer() {
        if (!isRunning || isPaused) return;
        
        clearInterval(timer);
        isPaused = true;
        isRunning = false;
    }

    // タイマーをリセットする関数
    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        isWorkTime = true;
        timeLeft = workTimeInput.value * 60;
        statusDisplay.textContent = '作業時間';
        container.classList.add('work-mode');
        container.classList.remove('break-mode');
        updateDisplay();
    }

    // イベントリスナーの設定
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    
    // 設定値が変更された時にタイマーをリセット
    workTimeInput.addEventListener('change', resetTimer);
    breakTimeInput.addEventListener('change', resetTimer);
    
    // 通知の許可を求める
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    // 初期表示の設定
    resetTimer();
    container.classList.add('work-mode');
});