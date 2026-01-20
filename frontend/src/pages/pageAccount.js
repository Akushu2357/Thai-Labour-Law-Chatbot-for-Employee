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
                        <option value="employee">ลูกจ้าง</option>
                        <option value="employer">นายจ้าง</option>
                        <option value="freelancer">ฟรีแลนซ์</option>
                        <option value="other">อื่นๆ</option>
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
                        <option value="full_time">งานประจำ</option>
                        <option value="part_time">งานพาร์ทไทม์</option>
                        <option value="contract">งานสัญญาจ้าง</option>
                        <option value="internship">ฝึกงาน</option>
                        <option value="other">อื่นๆ</option>
                    </select>
                </div>
                <button type="submit" className="account-button">บันทึกการเปลี่ยนแปลง</button>
            </form>
        </div>
    );
}

export default PageAccount;