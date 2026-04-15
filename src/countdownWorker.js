// countdownWorker.js (Debe estar en la misma carpeta del componente)
self.onmessage = function (e) {
  let timeLeft = e.data;
  const interval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(interval);
      self.postMessage("done"); // Envia mensaje al componente principal cuando termine
      self.close();
    } else {
      self.postMessage(timeLeft);
    }
  }, 1000);
};
