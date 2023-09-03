function createClickableCard(imageName, hoverImageName, link, containerId) {
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
  
  // Set object-fit property to cover
  image.style.objectFit = 'cover';

  // Add event listeners for mouseover and mouseout
  cardLink.addEventListener('mouseover', function() {
    image.src = `images/${hoverImageName}`;
    image.classList.add('flap'); // Add flap class on mouseover
  });
  
  cardLink.addEventListener('mouseout', function() {
    image.src = `images/${imageName}`;
    image.classList.remove('flap'); // Remove flap class on mouseout
  });

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
