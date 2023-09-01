async function readCSV(file, containerId) {
    const response = await fetch(file);
    const text = await response.text();
    const rows = text.split('\n');
  
    for (const row of rows) {
      const [imageName, link] = row.split(', ');
      createClickableCard(imageName, link, containerId);
    }
  }
  