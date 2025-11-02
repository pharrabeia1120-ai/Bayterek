const ITEMS_PER_PAGE = 10;
let currentPage = {
    evacuated: 1,
    notEvacuated: 1
};

// Глобальные переменные
let evacuatedPeople = [];
let notEvacuatedPeople = [];
let searchTerms = {
    evacuated: '',
    notEvacuated: ''
};
let notificationSound;
let lastEvacuatedPerson = null;
let currentDate = new Date();
let selectedDate = null;
let selectedDate2 = null;
let isAlertActive = false;
let autoEvacuationInterval = null;
let alertSound = null;
let evacuationStartTime = null;
let evacuationEndTime = null;
let evacuationTimer = null;
let isFirstAlert = true;

// Функция для обновления времени
function updateDateTime() {
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');
    
    const now = new Date();
    
    // Форматируем время
    const timeString = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Форматируем дату
    const dateString = now.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    if (timeElement) timeElement.textContent = timeString;
    if (dateElement) dateElement.textContent = dateString;
}

// Добавьте функцию для форматирования времени
function formatDuration(ms) {
    if (!ms) return '--:--:--';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
}

// Функции управления тревогой
function startAlert() {
    isAlertActive = true;
    const alertButton = document.getElementById('alertButton');
    const alertIcon = document.getElementById('alertIcon');
    const timerContainer = document.querySelector('.evacuation-timer');
    
    if (alertButton && alertIcon) {
        // Change button style
        alertButton.classList.remove('bg-blue-600');
        alertButton.classList.add('bg-red-600', 'animate-pulse');
        alertButton.classList.add('active');
        
        // Change icon
        alertIcon.src = './public/stop.svg';
        
        // Start auto evacuation only if it's not running
        if (!autoEvacuationInterval) {
            autoEvacuationInterval = setInterval(() => {
                if (Math.random() < 0.2 && notEvacuatedPeople.length > 0) {
                    simulateAutoEvacuation();
                }
            }, 5000);
        }

        // Start alert sound
        playAlertSound();
    }

    if (timerContainer) {
        timerContainer.classList.add('active');
    }

    // Set evacuation start time only if this is the first alert
    if (isFirstAlert) {
        evacuationStartTime = new Date();
        document.getElementById('evacuationStartTime').textContent = 
            evacuationStartTime.toLocaleTimeString('ru-RU');
        document.getElementById('evacuationEndTime').textContent = '--:--:--';
        isFirstAlert = false;
    }

    // Start or resume duration timer if it's not running
    if (!evacuationTimer) {
        const startTime = Date.now() - (evacuationEndTime ? evacuationEndTime - evacuationStartTime : 0);
        evacuationTimer = setInterval(() => {
            const duration = Date.now() - startTime;
            document.getElementById('evacuationDuration').textContent = 
                formatDuration(duration);
        }, 1000);
    }
}

const timerContainer = document.querySelector('.evacuation-timer');
    const spinner = document.getElementById('evacuationSpinner');
    
    if (timerContainer && spinner) {
        timerContainer.classList.add('active');
        spinner.classList.remove('hidden');
    }

    function stopAlert() {
    isAlertActive = false;
    const alertButton = document.getElementById('alertButton');
    const alertIcon = document.getElementById('alertIcon');
    const timerContainer = document.querySelector('.evacuation-timer');

    // Update end time without resetting start time
    evacuationEndTime = new Date();
    document.getElementById('evacuationEndTime').textContent = 
        evacuationEndTime.toLocaleTimeString('ru-RU');

    // Stop timer without resetting duration
    if (evacuationTimer) {
        clearInterval(evacuationTimer);
        evacuationTimer = null;
    }
    
    if (alertButton && alertIcon) {
        // Reset button style
        alertButton.classList.remove('bg-red-600', 'animate-pulse');
        alertButton.classList.add('bg-blue-600');
        alertButton.classList.remove('active');
        
        // Reset icon
        alertIcon.src = './public/radar.svg';

        // Stop auto evacuation
        if (autoEvacuationInterval) {
            clearInterval(autoEvacuationInterval);
            autoEvacuationInterval = null;
        }

        // Stop alert sound
        stopAlertSound();
    }

    if (timerContainer) {
        timerContainer.classList.remove('active');
    }
}

// Обновите функцию automaticAlertTrigger
function automaticAlertTrigger() {
    if (!isAlertActive) {
        startAlert();
    }
}

function toggleAlert() {
    if (isAlertActive) {
        stopAlert();
    } else {
        startAlert();
    }
}

function playAlertSound() {
    if (!alertSound) {
        alertSound = new Audio('./public/sounds/alert.mp3');
        alertSound.loop = true;
    }
    alertSound.play().catch(error => console.error('Error playing alert sound:', error));
}

function stopAlertSound() {
    if (alertSound) {
        alertSound.pause();
        alertSound.currentTime = 0;
    }
}

// Генерация мок-данных
function generateMockData(count, includeEvacTime = false) {
    const names = [
        "Айтбаев", "Ермеков", "Серікбаев", "Жунусов", "Омаров", "Бекенов", "Калдыбаев",
        "Сағындықов", "Мусинов", "Есенов", "Төлегенов", "Абдрахманов", "Нуркенов",
        "Жанұзақов", "Рахимов", "Исабаев", "Сейтқазинов", "Тұрсынов", "Муханов", "Қалиев"
    ];
    const firstNames = [
        "Алихан", "Ернар", "Даурен", "Асхат", "Бауыржан", "Нурсултан", "Темирлан",
        "Айгерим", "Динара", "Аружан", "Сая", "Жанель", "Айдана", "Мадина"
    ];
    const patronymics = [
        "Алиханович", "Ернарович", "Дауренович", "Асхатович", "Бауыржанович",
        "Алихановна", "Ернаровна", "Дауреновна", "Асхатовна", "Бауыржановна"
    ];

    return Array.from({ length: count }, () => {
        const floor = Math.floor(Math.random() * 20) + 1;
        const person = {
            name: `${names[Math.floor(Math.random() * names.length)]} ${
                firstNames[Math.floor(Math.random() * firstNames.length)]} ${
                patronymics[Math.floor(Math.random() * patronymics.length)]}`,
            room: `${floor}${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`,
            phone: `+7 (777) ${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${
                String(Math.floor(Math.random() * 99)).padStart(2, '0')}-${
                String(Math.floor(Math.random() * 99)).padStart(2, '0')}`,
            floor: String(floor),
            evacuationDate: includeEvacTime ? new Date() : null
        };
        if (includeEvacTime) {
            person.evacuationTime = getRandomTime();
        }
        return person;
    });
}

// Пагинация данных
function paginateData(items, page, searchTerm = '') {
    const filteredItems = searchTerm 
        ? items.filter(person => {
            const searchLower = searchTerm.toLowerCase();
            const personValues = [
                person.name,
                person.room,
                person.phone,
                person.floor,
                person.evacuationTime || ''
            ].map(val => String(val).toLowerCase());
            
            return personValues.some(value => value.includes(searchLower));
        })
        : items;

    const start = (page - 1) * ITEMS_PER_PAGE;
    return {
        items: filteredItems.slice(start, start + ITEMS_PER_PAGE),
        total: filteredItems.length
    };
}
// Фильтрация по дате
function filterByDateRange(items) {
    if (!selectedDate && !selectedDate2) {
        // Если даты не выбраны, показываем данные за текущий день
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return items.filter(person => {
            if (!person.evacuationDate) return false;
            
            const evacDate = new Date(person.evacuationDate);
            evacDate.setHours(0, 0, 0, 0);
            return evacDate.getTime() === today.getTime();
        });
    }

    // Если выбрана дата, фильтруем по ней
    return items.filter(person => {
        if (!person.evacuationDate) return false;
        
        const evacDate = new Date(person.evacuationDate);
        evacDate.setHours(0, 0, 0, 0);

        if (selectedDate && !selectedDate2) {
            // Фильтрация по одной дате
            const checkDate = new Date(selectedDate);
            checkDate.setHours(0, 0, 0, 0);
            return evacDate.getTime() === checkDate.getTime();
        }

        // Фильтрация по диапазону дат
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate2);
        endDate.setHours(23, 59, 59, 999);

        return evacDate >= startDate && evacDate <= endDate;
    });
}

// Обновление пагинации
function updatePagination(totalItems, currentPageNum, sectionId) {
    const container = document.getElementById(`${sectionId}Pagination`);
    if (!container) return;

    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    
    let paginationHTML = `
        <ul class="flex items-center justify-center -space-x-px h-8 text-sm">
            <li>
                <button onclick="changePage(${Math.max(1, currentPageNum - 1)}, '${sectionId}')" 
                        class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg ${currentPageNum === 1 ? 'cursor-not-allowed opacity-50' : ''}"
                        aria-label="Предыдущая страница">
                    <span class="sr-only">Previous</span>
                    <svg class="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
                    </svg>
                </button>
            </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li>
                <button onclick="changePage(${i}, '${sectionId}')"
                        class="flex items-center justify-center px-3 h-8 leading-tight ${
                            i === currentPageNum 
                            ? 'text-blue-600 border border-blue-300 bg-blue-50' 
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100'
                        }"
                        aria-label="Страница ${i}">
                    ${i}
                </button>
            </li>
        `;
    }

    paginationHTML += `
            <li>
                <button onclick="changePage(${Math.min(totalPages, currentPageNum + 1)}, '${sectionId}')"
                        class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg ${currentPageNum === totalPages ? 'cursor-not-allowed opacity-50' : ''}"
                        aria-label="Следующая страница">
                    <span class="sr-only">Next</span>
                    <svg class="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                    </svg>
                </button>
            </li>
        </ul>
    `;

    container.innerHTML = paginationHTML;
}

// Рендер таблицы
function renderTable(people, tableId, showButton = false) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;

    tbody.innerHTML = people.length === 0 
        ? '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Нет данных</td></tr>'
        : people.map(person => `
            <tr class="${person.isNew ? 'bg-yellow-100' : 'bg-white'} border-b transition-colors duration-300">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">${person.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${person.room}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${person.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${person.floor}</td>
                ${tableId === 'evacuatedTable' 
                    ? `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${person.evacuationTime || '-'}</td>`
                    : showButton 
                        ? `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            <button onclick="evacuatePerson('${person.name.replace(/'/g, "\\'")}')" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                                    aria-label="Эвакуировать ${person.name}">
                                Эвакуирован
                            </button>
                        </td>`
                        : ''}
            </tr>
        `).join('');
}

// Смена страницы
function changePage(page, sectionId) {
    let data = sectionId === 'evacuated' ? evacuatedPeople : notEvacuatedPeople;
    const searchTerm = searchTerms[sectionId];
    
    // Применяем фильтр по дате только для таблицы эвакуированных
    if (sectionId === 'evacuated') {
        data = filterByDateRange(data);
    }
    
    // Применяем поиск
    const { items: pageData, total: totalItems } = paginateData(data, page, searchTerm);
    
    // Обновляем текущую страницу
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    currentPage[sectionId] = Math.max(1, Math.min(page, totalPages));
    
    // Рендерим таблицу
    renderTable(
        pageData,
        `${sectionId}Table`,
        sectionId === 'notEvacuated'
    );
    
    // Обновляем пагинацию
    updatePagination(totalItems, currentPage[sectionId], sectionId);
    updateCounters();
}

// Эвакуация человека
function evacuatePerson(name) {
    const personIndex = notEvacuatedPeople.findIndex(p => p.name === name);
    if (personIndex === -1) return;

    const person = notEvacuatedPeople.splice(personIndex, 1)[0];
    const now = new Date();
    person.evacuationTime = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    person.evacuationDate = now; // Сохраняем полную дату
    person.isNew = true;
    evacuatedPeople.unshift(person);
    
    updateTables();
    showNotification(person);
    
    if (notEvacuatedPeople.length === 0 && isAlertActive) {
        stopAlert();
    }

    setTimeout(() => {
        person.isNew = false;
        updateTables();
    }, 3000);
}

// Уведомления
function showNotification(person) {
    const btn = document.getElementById('notificationBtn');
    if (!btn) return;

    lastEvacuatedPerson = person;
    btn.classList.add('has-notification');
    
    const bellContainer = btn.querySelector('.bell-container');
    if (bellContainer) {
        bellContainer.style.animation = 'bell-animation 650ms ease-out';
        bellContainer.addEventListener('animationend', () => {
            bellContainer.style.animation = '';
        }, { once: true });
    }
    
    playNotificationSound();
}

function playNotificationSound() {
    if (notificationSound) {
        notificationSound.currentTime = 0;
        notificationSound.play().catch(error => console.error('Error playing sound:', error));
    }
}

function showNotificationModal() {
    if (!lastEvacuatedPerson) return;

    const modal = document.getElementById('notificationModal');
    const content = document.getElementById('notificationContent');
    if (!modal || !content) return;

    content.innerHTML = `
        <div class="space-y-2">
            <p><span class="font-medium">ФИО:</span> ${lastEvacuatedPerson.name}</p>
            <p><span class="font-medium">Кабинет:</span> ${lastEvacuatedPerson.room}</p>
            <p><span class="font-medium">Этаж:</span> ${lastEvacuatedPerson.floor}</p>
            <p><span class="font-medium">Время эвакуации:</span> ${lastEvacuatedPerson.evacuationTime}</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeNotificationModal() {
    const modal = document.getElementById('notificationModal');
    const btn = document.getElementById('notificationBtn');
    if (modal && btn) {
        modal.classList.add('hidden');
        btn.classList.remove('has-notification');
    }
}

// Обновление таблиц
function updateTables() {
    const currentSection = document.getElementById('evacuatedSection')?.classList.contains('hidden') 
        ? 'notEvacuated' 
        : 'evacuated';
    changePage(currentPage[currentSection], currentSection);
}

// Обновление счетчиков
function updateCounters() {
    const totalCount = document.getElementById('totalCount');
    const evacuatedCount = document.getElementById('evacuatedCount');
    const notEvacuatedCount = document.getElementById('notEvacuatedCount');
    
    if (totalCount) totalCount.textContent = evacuatedPeople.length + notEvacuatedPeople.length;
    if (evacuatedCount) evacuatedCount.textContent = evacuatedPeople.length;
    if (notEvacuatedCount) notEvacuatedCount.textContent = notEvacuatedPeople.length;
}

// Обновление данных
function refreshData() {
    const currentSection = document.getElementById('evacuatedSection')?.classList.contains('hidden') 
        ? 'notEvacuated' 
        : 'evacuated';

    // Анимация для обеих кнопок обновления
    ['refreshButton', 'refreshButton2'].forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            const icon = btn.querySelector('svg');
            if (icon) {
                icon.style.transition = 'transform 0.5s';
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    icon.style.transform = 'rotate(0deg)';
                }, 500);
            }
        }
    });

    // Обновляем данные текущей активной секции
    changePage(1, currentSection);
}


// Переключение табов
function showTab(tabName) {
    const evacuatedSection = document.getElementById('evacuatedSection');
    const notEvacuatedSection = document.getElementById('notEvacuatedSection');
    const evacuatedBtn = document.getElementById('evacuatedBtn');
    const notEvacuatedBtn = document.getElementById('notEvacuatedBtn');
    
    if (!evacuatedSection || !notEvacuatedSection || !evacuatedBtn || !notEvacuatedBtn) return;

    if (tabName === 'evacuated') {
        evacuatedSection.classList.remove('hidden');
        notEvacuatedSection.classList.add('hidden');
        evacuatedBtn.classList.add('bg-blue-600', 'text-white');
        evacuatedBtn.classList.remove('text-gray-600');
        notEvacuatedBtn.classList.remove('bg-blue-600', 'text-white');
        notEvacuatedBtn.classList.add('text-gray-600');
        changePage(currentPage.evacuated, 'evacuated');
    } else {
        notEvacuatedSection.classList.remove('hidden');
        evacuatedSection.classList.add('hidden');
        notEvacuatedBtn.classList.add('bg-blue-600', 'text-white');
        notEvacuatedBtn.classList.remove('text-gray-600');
        evacuatedBtn.classList.remove('bg-blue-600', 'text-white');
        evacuatedBtn.classList.add('text-gray-600');
        changePage(currentPage.notEvacuated, 'notEvacuated');
    }
}

function simulateAutoEvacuation() {
    if (notEvacuatedPeople.length > 0) {
        // Start alert if not active
        if (!isAlertActive) {
            startAlert();
        }

        const randomIndex = Math.floor(Math.random() * notEvacuatedPeople.length);
        evacuatePerson(notEvacuatedPeople[randomIndex].name);
    } else if (isAlertActive) {
        stopAlert();
    }
}

// Создание календаря
function createCalendar({
    datepickerId,
    containerId,
    daysContainerId,
    currentMonthId,
    prevMonthId,
    nextMonthId,
    cancelButtonId,
    applyButtonId,
    selectedDateVar
}) {
    const datepicker = document.getElementById(datepickerId);
    const datepickerContainer = document.getElementById(containerId);
    const daysContainer = document.getElementById(daysContainerId);
    const currentMonthElement = document.getElementById(currentMonthId);
    const prevMonthButton = document.getElementById(prevMonthId);
    const nextMonthButton = document.getElementById(nextMonthId);
    const cancelButton = document.getElementById(cancelButtonId);
    const applyButton = document.getElementById(applyButtonId);

    if (!datepicker || !datepickerContainer || !daysContainer || !currentMonthElement ||
        !prevMonthButton || !nextMonthButton || !cancelButton || !applyButton) {
        console.error('Calendar elements missing');
        return;
    }

    function render() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        currentMonthElement.textContent = currentDate.toLocaleDateString('ru-RU', { 
            month: 'long', 
            year: 'numeric' 
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        let firstDayOfWeek = firstDay.getDay() || 7;
        firstDayOfWeek--;

        daysContainer.innerHTML = '';
        
        for (let i = 0; i < firstDayOfWeek; i++) {
            daysContainer.innerHTML += '<div></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isSelected = selectedDateVar && 
                selectedDateVar.getDate() === day && 
                selectedDateVar.getMonth() === month && 
                selectedDateVar.getFullYear() === year;

            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            dayElement.className = `flex items-center justify-center cursor-pointer w-[46px] h-[46px] text-gray-700 rounded-full hover:bg-blue-50 ${
                isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
            }`;
            
            dayElement.addEventListener('click', (e) => {
                e.stopPropagation(); // Предотвращаем всплытие
                selectedDateVar = date;
                render();
            });
            
            daysContainer.appendChild(dayElement);
        }
    }

    datepicker.addEventListener('click', (e) => {
        e.stopPropagation();
        datepickerContainer.classList.toggle('hidden');
        if (!datepickerContainer.classList.contains('hidden')) {
            render();
        }
    });

    prevMonthButton.addEventListener('click', (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() - 1);
        render();
    });

    nextMonthButton.addEventListener('click', (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() + 1);
        render();
    });

    cancelButton.addEventListener('click', () => {
        selectedDateVar = null;
        datepicker.value = '';
        datepickerContainer.classList.add('hidden');
    });

    applyButton.addEventListener('click', () => {
    if (selectedDateVar) {
        const formattedDate = selectedDateVar.toLocaleDateString('ru-RU');
        datepicker.value = formattedDate;
        
        if (datepickerId === 'datepicker') {
            // Если выбран текущий день, очищаем фильтр
            const today = new Date();
            if (selectedDateVar.toDateString() === today.toDateString()) {
                selectedDate = null;
                datepicker.value = 'Сегодня';
            } else {
                selectedDate = selectedDateVar;
            }
        } else {
            selectedDate2 = selectedDateVar;
        }
    } else {
        datepicker.value = 'Сегодня';
        if (datepickerId === 'datepicker') {
            selectedDate = null;
        } else {
            selectedDate2 = null;
        }
    }
    
    updateTables();
    datepickerContainer.classList.add('hidden');
});

    document.addEventListener('click', (e) => {
        if (!datepicker.contains(e.target) && !datepickerContainer.contains(e.target)) {
            datepickerContainer.classList.add('hidden');
        }
    });

    render();
}

    // Функция автоматического запуска тревоги (например, при срабатывании камеры)
function automaticAlertTrigger() {
    if (!isAlertActive) {
        startAlert();
        // Запускаем ускоренную эвакуацию если она еще не запущена
        if (!autoEvacuationInterval) {
            autoEvacuationInterval = setInterval(() => {
                if (notEvacuatedPeople.length > 0) {
                    for(let i = 0; i < 3; i++) {
                        if (notEvacuatedPeople.length > 0) {
                            const randomIndex = Math.floor(Math.random() * notEvacuatedPeople.length);
                            evacuatePerson(notEvacuatedPeople[randomIndex].name);
                        }
                    }
                } else {
                    stopAlert();
                }
            }, 2000);
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация мок-данных
    notEvacuatedPeople = generateMockData(40);

    // Инициализация поиска
    ['evacuated', 'notEvacuated'].forEach(sectionId => {
        const searchInput = document.getElementById(`${sectionId}Search`);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerms[sectionId] = e.target.value;
                changePage(1, sectionId);
            });
        }
    });

    // Инициализация времени эвакуации
    const startTimeEl = document.getElementById('evacuationStartTime');
    const endTimeEl = document.getElementById('evacuationEndTime');
    const durationEl = document.getElementById('evacuationDuration');

    if (startTimeEl && endTimeEl && durationEl) {
        startTimeEl.textContent = '--:--:--';
        endTimeEl.textContent = '--:--:--';
        durationEl.textContent = '--:--:--';
    }

    // Reset evacuation state
    isFirstAlert = true;
    evacuationStartTime = null;
    evacuationEndTime = null;

// Установка начального значения даты
    const datepicker = document.getElementById('datepicker');
    if (datepicker) {
        datepicker.value = 'Сегодня';
    }
    const datepicker2 = document.getElementById('datepicker2');
    if (datepicker2) {
        datepicker2.value = 'Сегодня';
    }

// Инициализация и обновление даты/времени
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Инициализация кнопки тревоги
    const alertButton = document.getElementById('alertButton');
    if (alertButton) {
        alertButton.addEventListener('click', toggleAlert);
    }


    // Инициализация звука уведомления
    notificationSound = document.getElementById('notificationSound');
    if (notificationSound) {
        notificationSound.volume = 0.5;
        notificationSound.preload = 'auto';
    }

    // Инициализация кнопки уведомления
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', showNotificationModal);
    }

    // Инициализация модального окна
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'notificationModal') {
                closeNotificationModal();
            }
        });
    }

    // Инициализация календарей
    createCalendar({
        datepickerId: 'datepicker',
        containerId: 'datepicker-container',
        daysContainerId: 'days-container',
        currentMonthId: 'currentMonth',
        prevMonthId: 'prevMonth',
        nextMonthId: 'nextMonth',
        cancelButtonId: 'cancelButton',
        applyButtonId: 'applyButton',
        selectedDateVar: selectedDate
    });

    createCalendar({
        datepickerId: 'datepicker2',
        containerId: 'datepicker-container2',
        daysContainerId: 'days-container2',
        currentMonthId: 'currentMonth2',
        prevMonthId: 'prevMonth2',
        nextMonthId: 'nextMonth2',
        cancelButtonId: 'cancelButton2',
        applyButtonId: 'applyButton2',
        selectedDateVar: selectedDate2
    });

    // Инициализация кнопок обновления
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshData);
    }

    const refreshButton2 = document.getElementById('refreshButton2');
    if (refreshButton2) {
        refreshButton2.addEventListener('click', refreshData);
    }

    // Начальная отрисовка
    updateTables();
    showTab('notEvacuated');
    updateCounters();

    // Запуск симуляции
    setInterval(simulateAutoEvacuation, 10000);
});