function createClickableCard(imageName, link, containerId) {
    const cardContainer = document.getElementById(containerId);
    const cardLink = document.createElement('a');
    cardLink.href = '#';
    cardLink.className = 'card';
    cardLink.onclick = function () {
      myfunction(link);
      return false;
    };
  
    const image = document.createElement('img');
    image.src = `images/${imageName}`;
    image.className = 'card-img-top';
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = imageName.split('.')[0];
    cardBody.appendChild(cardTitle);
    cardLink.appendChild(image);
    cardLink.appendChild(cardBody);
    cardContainer.appendChild(cardLink);
  }
  