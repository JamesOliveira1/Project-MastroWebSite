;(function(){
  function loadPartial(selector, url){
    var el = document.querySelector(selector)
    if(!el) return Promise.resolve()
    return fetch(url, {credentials: 'same-origin'})
      .then(function(res){ if(!res.ok) throw new Error('Falha ao buscar ' + url); return res.text() })
      .then(function(html){
        el.innerHTML = html
        if(selector === '#footer-placeholder'){
          var y = el.querySelector('#current-year')
          if(y) y.textContent = new Date().getFullYear()
        }
      })
      .catch(function(err){ console.error('Erro ao carregar parcial', url, err) })
  }

  document.addEventListener('DOMContentLoaded', function(){
    loadPartial('#header-placeholder', '../progenese/page/progenese_header.html')
    loadPartial('#footer-placeholder', '../assets/page/portfolio_footer.html')
  })
})();
