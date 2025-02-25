function addTopicFields() {
    const topicDiv = document.createElement('div');
    topicDiv.classList.add('topic-row');

    const topicInput = document.createElement('input');
    topicInput.type = 'text';
    topicInput.name = 'topicname';
    topicInput.classList.add('input-field', 'topic-input');
    topicInput.placeholder = 'Enter Topic';

    const contentContainer = document.createElement('div');
    contentContainer.classList.add('content-container');

    const contentInput = document.createElement('textarea');
    contentInput.classList.add('input-field', 'content-input');
    contentInput.placeholder = 'Enter Content';
    contentContainer.appendChild(contentInput);

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.classList.add('input-field', 'url-input');
    urlInput.placeholder = 'Enter URL';
    contentContainer.appendChild(urlInput);

    const addContentBtn = document.createElement('button');
    addContentBtn.type = 'button';
    addContentBtn.classList.add('addcontent-btn');
    addContentBtn.textContent = "Add Content";

    addContentBtn.onclick = function () {
        const newContentInput = document.createElement('textarea');
        newContentInput.classList.add('input-field', 'content-input');
        newContentInput.placeholder = 'Enter Additional Content';
        newContentInput.name = `contents[${topicInput.value.trim().replace(/\s+/g, '_')}]`;

        const newUrlInput = document.createElement('input');
        newUrlInput.type = 'url';
        newUrlInput.classList.add('input-field', 'url-input');
        newUrlInput.placeholder = 'Enter URL';
        newUrlInput.name = `url{${newContentInput.name}}`;

        const lineBreak = document.createElement('br');
        contentContainer.appendChild(lineBreak);
        contentContainer.appendChild(newContentInput);
        contentContainer.appendChild(newUrlInput);
    };

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.classList.add('remove-btn');
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = function () {
        topicDiv.remove();
    };

    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('button-wrapper');
    buttonWrapper.appendChild(addContentBtn);
    buttonWrapper.appendChild(removeBtn);

    topicDiv.appendChild(topicInput);
    topicDiv.appendChild(contentContainer);
    topicDiv.appendChild(buttonWrapper);

    document.getElementById('topics-container').appendChild(topicDiv);

    topicInput.addEventListener('input', function () {
        const topicName = topicInput.value.trim().replace(/\s+/g, '_');
        if (topicName) {
            contentInput.name = `contents[${topicName}]`;
            urlInput.name = `url{${contentInput.name}}`;
        }
    });
}
