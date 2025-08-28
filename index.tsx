
import { GoogleGenAI } from "@google/genai";

// Fix for "Cannot find name 'Chart'". This assumes Chart.js is loaded globally (e.g., via a script tag).
declare var Chart: any;
// Fix for "Cannot find name 'bootstrap'". This assumes Bootstrap is loaded globally.
declare var bootstrap: any;

document.addEventListener('DOMContentLoaded', () => {

    const appContent = document.getElementById('app-content');
    if (!appContent) return;
    
    // --- MODAL INSTANCE ---
    const formModalEl = document.getElementById('formModal');
    const formModal = new bootstrap.Modal(formModalEl);


    // --- MOCK DATA ---
    let cars = [
        { id: 1, brand: 'Toyota', model: 'Yaris', plate: 'กท 1234', price_day: 800, price_month: 15000, status: 'ว่าง' },
        { id: 2, brand: 'Honda', model: 'City', plate: 'ขข 5678', price_day: 900, price_month: 17000, status: 'ว่าง' },
        { id: 3, brand: 'Mazda', model: 'Mazda 2', plate: 'งง 9999', price_day: 950, price_month: 18000, status: 'ถูกจอง' },
        { id: 4, brand: 'Suzuki', model: 'Swift', plate: 'จจ 1111', price_day: 750, price_month: 14000, status: 'ซ่อมบำรุง' }
    ];
    let customers = [
        { id: 1, name: 'สมชาย ใจดี', phone: '081-234-5678', email: 'somchai@email.com' },
        { id: 2, name: 'สมหญิง จริงใจ', phone: '082-345-6789', email: 'somying@email.com' },
    ];
    let bookings = [
        { id: 1, customer_id: 1, car_id: 3, start_date: '2024-08-05', end_date: '2024-08-10', total_price: 5700, status: 'ใช้งานอยู่' },
        { id: 2, customer_id: 2, car_id: 1, start_date: '2024-08-15', end_date: '2024-08-18', total_price: 3200, status: 'รอดำเนินการ' },
        { id: 3, customer_id: 1, car_id: 2, start_date: '2024-07-20', end_date: '2024-07-25', total_price: 5400, status: 'คืนแล้ว' },
    ];
    let payments = [
        { id: 1, booking_id: 3, amount: 5400, date: '2024-07-20', method: 'โอนเงิน' }
    ];

    // --- ROUTER / NAVIGATION ---
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    const navigateTo = (page) => {
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.sidebar .nav-link[data-page="${page}"]`);
        if (activeLink) activeLink.classList.add('active');

        appContent.innerHTML = ''; // Clear content
        switch (page) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'calendar':
                renderCalendar();
                break;
            case 'bookings':
                renderBookings();
                break;
            case 'cars':
                renderCars();
                break;
            case 'customers':
                renderCustomers();
                break;
            case 'payments':
                renderPayments();
                break;
            case 'invoices':
                renderInvoices();
                break;
            default:
                appContent.innerHTML = '<h1>Page not found</h1>';
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = (e.currentTarget as HTMLElement).dataset.page;
            if (page) navigateTo(page);
        });
    });
    
    // --- UTILITY FUNCTIONS ---
    const formatCurrency = (amount) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount).replace('฿', '');

    // --- MODAL & FORM FUNCTIONS ---
    const showModal = (title, body, footer) => {
        document.getElementById('formModalLabel').textContent = title;
        document.getElementById('formModalBody').innerHTML = body;
        document.getElementById('formModalFooter').innerHTML = footer;
        formModal.show();
    };

    // --- RENDER FUNCTIONS ---

    const renderDashboard = () => {
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const activeBookings = bookings.filter(b => b.status === 'ใช้งานอยู่').length;
        const totalCars = cars.length;
        const totalCustomers = customers.length;
        
        appContent.innerHTML = `
            <div class="page-header">
                <h1>Dashboard</h1>
                <p class="text-muted">ภาพรวมของระบบรถเช่า JIRA</p>
            </div>
            <div class="row mb-4">
                <div class="col-lg-3 col-md-6 mb-4">
                    <div class="card stat-card revenue-card">
                        <div class="card-body">
                            <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
                            <h6>รายได้รวม</h6>
                            <h3>${formatCurrency(totalRevenue)} บาท</h3>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-4">
                    <div class="card stat-card bookings-card">
                        <div class="card-body">
                            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                            <h6>การจองที่ใช้งานอยู่</h6>
                            <h3>${activeBookings} รายการ</h3>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-4">
                    <div class="card stat-card cars-card">
                        <div class="card-body">
                            <div class="stat-icon"><i class="fas fa-car"></i></div>
                            <h6>จำนวนรถทั้งหมด</h6>
                            <h3>${totalCars} คัน</h3>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-4">
                    <div class="card stat-card customers-card">
                        <div class="card-body">
                            <div class="stat-icon"><i class="fas fa-users"></i></div>
                            <h6>จำนวนลูกค้า</h6>
                            <h3>${totalCustomers} คน</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-8 mb-4">
                    <div class="chart-container">
                        <h5 class="chart-title">รายได้รายเดือน (6 เดือนล่าสุด)</h5>
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>
                <div class="col-lg-4 mb-4">
                    <div class="chart-container">
                        <h5 class="chart-title">สถานะรถยนต์</h5>
                        <canvas id="carStatusChart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        // Init Charts
        const revenueCtx = (document.getElementById('revenueChart') as HTMLCanvasElement).getContext('2d');
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.'],
                datasets: [{ 
                    label: 'รายได้',
                    data: [15000, 18000, 25000, 22000, 31000, 45000],
                    backgroundColor: '#3498db',
                    borderRadius: 5
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });

        const carStatusCtx = (document.getElementById('carStatusChart') as HTMLCanvasElement).getContext('2d');
        const carStatusData = cars.reduce((acc, car) => {
            acc[car.status] = (acc[car.status] || 0) + 1;
            return acc;
        }, {});
        new Chart(carStatusCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(carStatusData),
                datasets: [{
                    data: Object.values(carStatusData),
                    backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    };

    const renderCalendar = (date = new Date()) => {
        const month = date.getMonth();
        const year = date.getFullYear();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        let calendarHTML = `
            <div class="page-header"><h1>ปฏิทินการจอง</h1></div>
            <div class="calendar-container">
                <div class="calendar-header">
                    <button class="btn btn-outline-primary" id="prev-month">&lt;</button>
                    <h3>${new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(date)}</h3>
                    <button class="btn btn-outline-primary" id="next-month">&gt;</button>
                </div>
                <div class="calendar-grid">
                    <div class="calendar-day-name">อา</div>
                    <div class="calendar-day-name">จ</div>
                    <div class="calendar-day-name">อ</div>
                    <div class="calendar-day-name">พ</div>
                    <div class="calendar-day-name">พฤ</div>
                    <div class="calendar-day-name">ศ</div>
                    <div class="calendar-day-name">ส</div>
        `;

        for (let i = 0; i < startDayOfWeek; i++) {
            calendarHTML += `<div class="calendar-day other-month"></div>`;
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            calendarHTML += `<div class="calendar-day" data-date="${currentDate.toISOString().split('T')[0]}">
                                <div class="day-number">${day}</div>`;

            bookings.forEach(booking => {
                const startDate = new Date(booking.start_date);
                const endDate = new Date(booking.end_date);
                if (currentDate >= startDate && currentDate <= endDate) {
                    const car = cars.find(c => c.id === booking.car_id);
                    calendarHTML += `<div class="calendar-event">${car.model} (${car.plate})</div>`;
                }
            });
                                
            calendarHTML += `</div>`;
        }
        
        calendarHTML += '</div></div>';
        appContent.innerHTML = calendarHTML;
        
        document.getElementById('prev-month').addEventListener('click', () => renderCalendar(new Date(year, month - 1, 1)));
        document.getElementById('next-month').addEventListener('click', () => renderCalendar(new Date(year, month + 1, 1)));
    };
    
    const renderGenericTable = (title, headers, dataRows, addBtnLabel, addBtnId) => {
        appContent.innerHTML = `
            <div class="page-header d-flex justify-content-between align-items-center">
                <h1>${title}</h1>
                ${addBtnLabel ? `<button id="${addBtnId}" class="btn btn-primary"><i class="fas fa-plus me-2"></i>${addBtnLabel}</button>` : ''}
            </div>
            <div class="table-container">
               <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                ${headers.map(h => `<th>${h}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${dataRows.join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };
    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'ว่าง': return `<span class="status-badge status-success">${status}</span>`;
            case 'ถูกจอง':
            case 'รอดำเนินการ':
            case 'ใช้งานอยู่':
                return `<span class="status-badge status-warning">${status}</span>`;
            case 'ซ่อมบำรุง': return `<span class="status-badge status-danger">${status}</span>`;
            case 'คืนแล้ว': return `<span class="status-badge status-info">${status}</span>`;
            default: return `<span class="status-badge">${status}</span>`;
        }
    };

    // --- CARS CRUD ---
    const renderCars = () => {
        renderGenericTable(
            'จัดการข้อมูลรถ',
            ['#', 'ยี่ห้อ', 'รุ่น', 'ทะเบียน', 'ราคา/วัน', 'สถานะ', ''],
            cars.map(car => `
                <tr>
                    <td>${car.id}</td>
                    <td>${car.brand}</td>
                    <td>${car.model}</td>
                    <td>${car.plate}</td>
                    <td>${formatCurrency(car.price_day)}</td>
                    <td>${getStatusBadge(car.status)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${car.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${car.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `),
            'เพิ่มรถใหม่',
            'add-car-btn'
        );
        attachCarEventListeners();
    };
    
    const attachCarEventListeners = () => {
        document.getElementById('add-car-btn')?.addEventListener('click', () => showCarForm());
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', e => showCarForm(parseInt((e.currentTarget as HTMLElement).dataset.id))));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', e => deleteCar(parseInt((e.currentTarget as HTMLElement).dataset.id))));
    };

    const showCarForm = (carId = null) => {
        // Fix: Cast car to `any` to handle new car case (empty object) without TS errors
        const car: any = carId ? cars.find(c => c.id === carId) : {};
        const title = carId ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถใหม่';
        const carStatuses = ['ว่าง', 'ถูกจอง', 'ซ่อมบำรุง'];

        const body = `
            <form id="car-form">
                <input type="hidden" name="id" value="${car.id || ''}">
                <div class="row">
                    <div class="col-md-6 mb-3"><label class="form-label">ยี่ห้อ</label><input type="text" class="form-control" name="brand" value="${car.brand || ''}" required></div>
                    <div class="col-md-6 mb-3"><label class="form-label">รุ่น</label><input type="text" class="form-control" name="model" value="${car.model || ''}" required></div>
                    <div class="col-md-6 mb-3"><label class="form-label">เลขทะเบียน</label><input type="text" class="form-control" name="plate" value="${car.plate || ''}" required></div>
                    <div class="col-md-6 mb-3"><label class="form-label">สถานะ</label><select class="form-select" name="status">${carStatuses.map(s => `<option value="${s}" ${car.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
                    <div class="col-md-6 mb-3"><label class="form-label">ราคา/วัน</label><input type="number" class="form-control" name="price_day" value="${car.price_day || ''}" required></div>
                </div>
            </form>
        `;
        const footer = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button><button type="button" class="btn btn-primary" id="save-car-btn">บันทึก</button>`;
        
        showModal(title, body, footer);

        document.getElementById('save-car-btn').addEventListener('click', () => {
            const form = document.getElementById('car-form') as HTMLFormElement;
            if (form.checkValidity()) {
                const formData = new FormData(form);
                // Fix: Cast FormDataEntryValue to string and add missing price_month
                const carData = {
                    id: carId || Math.max(...cars.map(c => c.id), 0) + 1,
                    brand: formData.get('brand') as string,
                    model: formData.get('model') as string,
                    plate: formData.get('plate') as string,
                    price_day: parseFloat(formData.get('price_day') as string),
                    price_month: car.price_month || 0,
                    status: formData.get('status') as string
                };
                if (carId) {
                    cars = cars.map(c => c.id === carId ? carData : c);
                } else {
                    cars.push(carData);
                }
                formModal.hide();
                navigateTo('cars');
            } else {
                form.reportValidity();
            }
        });
    };

    const deleteCar = (carId) => {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรถคันนี้?')) {
            cars = cars.filter(c => c.id !== carId);
            navigateTo('cars');
        }
    };
    
    // --- CUSTOMERS CRUD ---
    const renderCustomers = () => {
        renderGenericTable(
            'จัดการข้อมูลลูกค้า',
            ['#', 'ชื่อ-สกุล', 'เบอร์โทร', 'อีเมล', ''],
            customers.map(c => `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.name}</td>
                    <td>${c.phone}</td>
                    <td>${c.email}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${c.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${c.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `),
            'เพิ่มลูกค้าใหม่',
            'add-customer-btn'
        );
        attachCustomerEventListeners();
    };
    
    const attachCustomerEventListeners = () => {
        document.getElementById('add-customer-btn')?.addEventListener('click', () => showCustomerForm());
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', e => showCustomerForm(parseInt((e.currentTarget as HTMLElement).dataset.id))));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', e => deleteCustomer(parseInt((e.currentTarget as HTMLElement).dataset.id))));
    };
    
    const showCustomerForm = (customerId = null) => {
        // Fix: Cast customer to `any` to handle new customer case (empty object) without TS errors
        const customer: any = customerId ? customers.find(c => c.id === customerId) : {};
        const title = customerId ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่';
        
        const body = `
            <form id="customer-form">
                <div class="mb-3"><label class="form-label">ชื่อ-สกุล</label><input type="text" class="form-control" name="name" value="${customer.name || ''}" required></div>
                <div class="mb-3"><label class="form-label">เบอร์โทร</label><input type="tel" class="form-control" name="phone" value="${customer.phone || ''}" required></div>
                <div class="mb-3"><label class="form-label">อีเมล</label><input type="email" class="form-control" name="email" value="${customer.email || ''}" required></div>
            </form>
        `;
        const footer = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button><button type="button" class="btn btn-primary" id="save-customer-btn">บันทึก</button>`;

        showModal(title, body, footer);

        document.getElementById('save-customer-btn').addEventListener('click', () => {
            const form = document.getElementById('customer-form') as HTMLFormElement;
             if (form.checkValidity()) {
                const formData = new FormData(form);
                // Fix: Cast FormDataEntryValue to string
                const customerData = {
                    id: customerId || Math.max(...customers.map(c => c.id), 0) + 1,
                    name: formData.get('name') as string,
                    phone: formData.get('phone') as string,
                    email: formData.get('email') as string
                };
                if (customerId) {
                    customers = customers.map(c => c.id === customerId ? customerData : c);
                } else {
                    customers.push(customerData);
                }
                formModal.hide();
                navigateTo('customers');
            } else {
                form.reportValidity();
            }
        });
    };
    
    const deleteCustomer = (customerId) => {
         if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบลูกค้ารายนี้?')) {
            customers = customers.filter(c => c.id !== customerId);
            navigateTo('customers');
        }
    };
    

    // --- BOOKINGS CRUD ---
    const renderBookings = () => {
        renderGenericTable(
            'ข้อมูลการจอง',
            ['#', 'ลูกค้า', 'รถ', 'วันที่เริ่ม', 'วันที่คืน', 'ราคา', 'สถานะ', ''],
            bookings.map(b => {
                const customer = customers.find(c => c.id === b.customer_id);
                const car = cars.find(c => c.id === b.car_id);
                return `
                    <tr>
                        <td>${b.id}</td>
                        <td>${customer?.name || 'N/A'}</td>
                        <td>${car?.model || 'N/A'} (${car?.plate || ''})</td>
                        <td>${new Date(b.start_date).toLocaleDateString('th-TH')}</td>
                        <td>${new Date(b.end_date).toLocaleDateString('th-TH')}</td>
                        <td>${formatCurrency(b.total_price)}</td>
                        <td>${getStatusBadge(b.status)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${b.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${b.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            }),
            'เพิ่มการจองใหม่',
            'add-booking-btn'
        );
        attachBookingEventListeners();
    };

    const attachBookingEventListeners = () => {
        document.getElementById('add-booking-btn')?.addEventListener('click', () => showBookingForm());
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', e => showBookingForm(parseInt((e.currentTarget as HTMLElement).dataset.id))));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', e => deleteBooking(parseInt((e.currentTarget as HTMLElement).dataset.id))));
    };

    const showBookingForm = (bookingId = null) => {
        // Fix: Cast booking to `any` to handle new booking case (empty object) without TS errors
        const booking: any = bookingId ? bookings.find(b => b.id === bookingId) : {};
        const title = bookingId ? 'แก้ไขการจอง' : 'เพิ่มการจองใหม่';
        const bookingStatuses = ['รอดำเนินการ', 'ใช้งานอยู่', 'คืนแล้ว'];

        const body = `
            <form id="booking-form">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">ลูกค้า</label>
                        <select class="form-select" name="customer_id" required>
                            <option value="">-- เลือกลูกค้า --</option>
                            ${customers.map(c => `<option value="${c.id}" ${booking.customer_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">รถ</label>
                        <select class="form-select" name="car_id" required>
                             <option value="">-- เลือกรถ --</option>
                            ${cars.map(c => `<option value="${c.id}" ${booking.car_id === c.id ? 'selected' : ''}>${c.brand} ${c.model} (${c.plate})</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-6 mb-3"><label class="form-label">วันที่เริ่ม</label><input type="date" class="form-control" name="start_date" value="${booking.start_date || ''}" required></div>
                    <div class="col-md-6 mb-3"><label class="form-label">วันที่คืน</label><input type="date" class="form-control" name="end_date" value="${booking.end_date || ''}" required></div>
                    <div class="col-md-6 mb-3"><label class="form-label">ราคารวม</label><input type="number" class="form-control" name="total_price" value="${booking.total_price || ''}" required></div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">สถานะ</label>
                        <select class="form-select" name="status" required>
                           ${bookingStatuses.map(s => `<option value="${s}" ${booking.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </form>
        `;
        const footer = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button><button type="button" class="btn btn-primary" id="save-booking-btn">บันทึก</button>`;
        showModal(title, body, footer);

        document.getElementById('save-booking-btn').addEventListener('click', () => {
            const form = document.getElementById('booking-form') as HTMLFormElement;
            if (form.checkValidity()) {
                const formData = new FormData(form);
                // Fix: Cast FormDataEntryValue to string
                const bookingData = {
                    id: bookingId || Math.max(...bookings.map(b => b.id), 0) + 1,
                    customer_id: parseInt(formData.get('customer_id') as string),
                    car_id: parseInt(formData.get('car_id') as string),
                    start_date: formData.get('start_date') as string,
                    end_date: formData.get('end_date') as string,
                    total_price: parseFloat(formData.get('total_price') as string),
                    status: formData.get('status') as string
                };

                 if (bookingId) {
                    bookings = bookings.map(b => b.id === bookingId ? bookingData : b);
                } else {
                    bookings.push(bookingData);
                }
                formModal.hide();
                navigateTo('bookings');
            } else {
                 form.reportValidity();
            }
        });
    };
    
    const deleteBooking = (bookingId) => {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบการจองนี้?')) {
            bookings = bookings.filter(b => b.id !== bookingId);
            navigateTo('bookings');
        }
    };
    
    const renderPayments = () => {
        renderGenericTable(
            'ข้อมูลการชำระเงิน',
            ['#', 'รหัสจอง', 'ลูกค้า', 'จำนวนเงิน', 'วันที่ชำระ', 'วิธีชำระ', ''],
             payments.map(p => {
                const booking = bookings.find(b => b.id === p.booking_id);
                const customer = customers.find(c => c.id === booking?.customer_id);
                return `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.booking_id}</td>
                        <td>${customer?.name || 'N/A'}</td>
                        <td>${formatCurrency(p.amount)}</td>
                        <td>${new Date(p.date).toLocaleDateString('th-TH')}</td>
                        <td>${p.method}</td>
                        <td><button class="btn btn-sm btn-outline-primary"><i class="fas fa-search"></i></button></td>
                    </tr>
                `;
            }),
            null,
            null
        );
    };

    const renderInvoices = () => {
        appContent.innerHTML = `
            <div class="page-header"><h1>ออกเอกสาร</h1></div>
            <div class="invoice-actions card p-3 mb-4">
                <div class="row g-3 align-items-center">
                    <div class="col-md-4">
                        <label for="doc-type" class="form-label">ประเภทเอกสาร</label>
                        <select id="doc-type" class="form-select">
                            <option value="quote">ใบเสนอราคา</option>
                            <option value="invoice">ใบแจ้งหนี้</option>
                            <option value="receipt">ใบเสร็จรับเงิน</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="booking-select" class="form-label">เลือกการจอง</label>
                        <select id="booking-select" class="form-select">
                            <option value="">-- กรุณาเลือก --</option>
                            ${bookings.map(b => `<option value="${b.id}">จอง #${b.id} - ${customers.find(c => c.id === b.customer_id).name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-4 d-flex align-items-end">
                        <button id="print-btn" class="btn btn-success w-100"><i class="fas fa-print me-2"></i>พิมพ์เอกสาร</button>
                    </div>
                </div>
            </div>
            <div id="invoice-preview">
                <!-- Preview will be rendered here -->
            </div>
        `;

        const bookingSelect = document.getElementById('booking-select');
        const docTypeSelect = document.getElementById('doc-type');
        bookingSelect.addEventListener('change', () => renderInvoicePreview());
        docTypeSelect.addEventListener('change', () => renderInvoicePreview());
        document.getElementById('print-btn').addEventListener('click', () => window.print());
    };
    
    const renderInvoicePreview = () => {
        const previewEl = document.getElementById('invoice-preview');
        // Fix: Cast HTMLElement to HTMLSelectElement to access 'value' property.
        const bookingId = (document.getElementById('booking-select') as HTMLSelectElement).value;
        // Fix: Cast HTMLElement to HTMLSelectElement to access 'value' property.
        const docType = (document.getElementById('doc-type') as HTMLSelectElement).value;
        if (!bookingId) {
            previewEl.innerHTML = '';
            return;
        }

        const booking = bookings.find(b => b.id === parseInt(bookingId));
        const customer = customers.find(c => c.id === booking.customer_id);
        const car = cars.find(c => c.id === booking.car_id);
        
        const docTitles = {
            quote: 'ใบเสนอราคา',
            invoice: 'ใบแจ้งหนี้',
            receipt: 'ใบเสร็จรับเงิน'
        };

        const tax = booking.total_price * 0.07;
        const grandTotal = booking.total_price + tax;

        previewEl.innerHTML = `
        <div class="invoice-box">
            <table>
                <tr class="top">
                    <td colspan="4">
                        <table>
                            <tr>
                                <td>
                                    <strong>บริษัท จิรา คาร์เร้นท์ จำกัด</strong><br>
                                    49/15 ถ.หอการค้า ต.บ้านพรุ อ.หาดใหญ่ จ.สงขลา 90250<br>
                                    Tax ID: 0905565006513
                                </td>
                                <td style="text-align: right;">
                                    <div class="invoice-header">${docTitles[docType]}</div>
                                    <div>เลขที่: INV-00${booking.id}</div>
                                    <div>วันที่: ${new Date().toLocaleDateString('th-TH')}</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="information">
                    <td colspan="4">
                         <table>
                            <tr>
                                <td>
                                    <strong>ลูกค้า:</strong><br>
                                    ${customer.name}<br>
                                    ${customer.phone}<br>
                                    ${customer.email}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="heading">
                    <td>รายการ</td>
                    <td style="text-align:center;">จำนวน</td>
                    <td style="text-align:right;">ราคา/หน่วย</td>
                    <td style="text-align:right;">รวม</td>
                </tr>
                <tr class="item">
                    <td>ค่าเช่ารถ ${car.brand} ${car.model} (${car.plate})<br>
                    <small>(${new Date(booking.start_date).toLocaleDateString('th-TH')} - ${new Date(booking.end_date).toLocaleDateString('th-TH')})</small>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">${formatCurrency(booking.total_price)}</td>
                    <td style="text-align:right;">${formatCurrency(booking.total_price)}</td>
                </tr>
                <tr class="total">
                    <td colspan="2"></td>
                    <td style="text-align:right;">รวมเป็นเงิน</td>
                    <td style="text-align:right;">${formatCurrency(booking.total_price)}</td>
                </tr>
                 <tr class="total">
                    <td colspan="2"></td>
                    <td style="text-align:right;">ภาษีมูลค่าเพิ่ม 7%</td>
                    <td style="text-align:right;">${formatCurrency(tax)}</td>
                </tr>
                 <tr class="total">
                    <td colspan="2"></td>
                    <td style="text-align:right;"><strong>ยอดรวมสุทธิ</strong></td>
                    <td style="text-align:right;"><strong>${formatCurrency(grandTotal)}</strong></td>
                </tr>
            </table>
        </div>
        `;
    };

    // --- INITIALIZE APP ---
    navigateTo('dashboard');
});