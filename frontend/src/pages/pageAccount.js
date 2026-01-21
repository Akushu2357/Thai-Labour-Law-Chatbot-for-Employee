import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./pageAccount.css";

function PageAccount() {
    const { user } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [birthdate, setBirthdate] = useState(user?.birthdate || '');
    const [status, setStatus] = useState(user?.status || '');
    const [startDate, setStartDate] = useState(user?.startDate || '');
    const [jobType, setJobType] = useState(user?.jobType || '');

    return (
        <div className="page-account">
            <div className="account-title"><h1>จัดการบัญชี</h1></div>
            <form className="account-form">
                <div>
                    <label className="account-label">อีเมล:</label>
                    <input className="account-input" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label className="account-label">วัน/เดือน/ปีเกิด:</label>
                    <input className="account-input" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
                </div>
                <div>
                    <label className="account-label">สถานะของคุณ:</label>
                    <select className="account-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="" disabled>-- โปรดเลือกสถานะ --</option>
                        <option value="Permanent Employee">ลูกจ้างประจำ (Permanent Employee)</option>
                        <option value="Probationary Employee">ลูกจ้างทดลองงาน (Probationary Employee)</option>
                        <option value="Fixed-term Contract">ลูกจ้างชั่วคราว (Fixed-term Contract)</option>
                        <option value="Daily/Part-time Worker">ลูกจ้างรายวัน / รายชั่วโมง (Daily/Part-time Worker)</option>
                        <option value="Outsourced">ลูกจ้างรับเหมาค่าแรง (Outsourced)</option>
                        <option value="Intern">นักศึกษาฝึกงาน (Intern)</option>
                        <option value="Employer/Owner">เจ้าของกิจการ / นายจ้าง (Employer/Owner)</option>
                        <option value="HR / Personnel Manager">ฝ่ายบุคคล (HR / Personnel Manager)</option>
                        <option value="Manager/Supervisor">หัวหน้างาน / ผู้บริหาร (Manager/Supervisor)</option>
                        <option value="Freelancer/Independent Contractor">ฟรีแลนซ์ / จ้างทำของ (Freelancer/Independent Contractor)</option>
                        <option value="Other">อื่นๆ</option>
                    </select>
                </div>
                <div>
                    <label className="account-label">วัน/เดือน/ปีที่เริ่มงาน:</label>
                    <input className="account-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                    <label className="account-label">ลักษณะงาน:</label>
                    <select className="account-input" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                        <option value="" disabled>-- โปรดเลือกลักษณะงาน --</option>
                        <option value="Office / Corporate">งานสำนักงาน (Office / Corporate)</option>
                        <option value="Manufacturing / Factory">งานผลิตและอุตสาหกรรม (Manufacturing / Factory)</option>
                        <option value="Service / Hospitality / Retail">งานบริการและค้าปลีก (Service / Hospitality / Retail)</option>
                        <option value="Transportation / Logistics">งานขนส่งและโลจิสติกส์ (Transportation / Logistics)</option>
                        <option value="Construction / Field Work">งานก่อสร้างและงานสนาม (Construction / Field Work)</option>
                        <option value="Hazardous Work">งานอันตราย (Hazardous Work)</option>
                        <option value="Agriculture / Forestry Work">งานเกษตรและป่าไม้ (Agriculture / Forestry Work)</option>
                        <option value="Other">อื่นๆ</option>
                    </select>
                </div>
                <button type="submit" className="account-button">บันทึกการเปลี่ยนแปลง</button>
            </form>
        </div>
    );
}

export default PageAccount;