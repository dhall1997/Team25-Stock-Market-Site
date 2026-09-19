fetch('/stocks')
  .then(res => res.json())
  .then(data => {
    document.getElementById('stock-data').innerText =
      JSON.stringify(data, null, 2);
  })
  .catch(err => {
    document.getElementById('stock-data').innerText =
      'Error: ' + err;
  });



