import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import userService from "../services/userService";
import "./pageAccount.css";

function PageAccount() {
    const { user, logout } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [birthdate, setBirthdate] = useState(user?.date_of_birth || '');
    const [status, setStatus] = useState(user?.job_description || '');
    const [startDate, setStartDate] = useState(user?.start_work_date || '');
    const [jobType, setJobType] = useState(user?.job_type_description || '');
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [userLoading, setUserLoading] = useState(true);

    // Keep email in sync with auth user
    useEffect(() => {
        setEmail(user?.email || '');
    }, [user?.email]);

    // Fetch jobs and job_types on component mount
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setOptionsLoading(true);
                const [jobsData, jobTypesData] = await Promise.all([
                    userService.getJobs(),
                    userService.getJobTypes()
                ]);
                setJobs(jobsData);
                setJobTypes(jobTypesData);
            } catch (error) {
                console.error('Error fetching options:', error);
            } finally {
                setOptionsLoading(false);
            }
        };

        fetchOptions();
    }, []);

    // Fetch user profile first, then allow editing
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user?.id) {
                setUserLoading(false);
                return;
            }

            try {
                setUserLoading(true);
                const profile = await userService.getUser(user.id);
                setBirthdate(profile?.date_of_birth || '');
                setStatus(profile?.job_description || '');
                setStartDate(profile?.start_work_date || '');
                setJobType(profile?.job_type_description || '');
            } catch (error) {
                console.error('Error loading user profile:', error);
            } finally {
                setUserLoading(false);
            }
        };

        fetchUserProfile();
    }, [user?.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (userLoading || !user?.id) {
            return;
        }
        setLoading(true);

        try {
            const updateData = {
                date_of_birth: birthdate || null,
                job_description: status || null,
                start_work_date: startDate || null,
                job_type_description: jobType || null
            };

            await userService.updateUser(user.id, updateData);
        } catch (error) {
            console.error('Error saving user data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-account" data-testid="account-page">
            <div className="account-title" data-testid="account-page-title"><span className="text-h1"><strong>จัดการบัญชี</strong></span></div>
            <form className="account-form" onSubmit={handleSubmit} data-testid="account-form">
                <div>
                    <label className="text-small account-label">อีเมล:</label>
                    <input className="text-small account-input" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled data-testid="account-email-input" />
                </div>
                <div>
                    <label className="text-small account-label">วัน/เดือน/ปีเกิด:</label>
                    <input className="text-small account-input" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} disabled={userLoading || loading} data-testid="account-birthdate-input" />
                </div>
                <div>
                    {/* Job */}
                    <label className="text-small account-label">สถานะของคุณ:</label>
                    <select className="text-small account-input" value={status} onChange={(e) => setStatus(e.target.value)} disabled={optionsLoading || userLoading || loading} data-testid="account-job-select">
                        <option value="" disabled>-- โปรดเลือกสถานะ --</option>
                        {jobs.map((job) => (
                            <option key={job.id} value={job.description}>{job.description}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-small account-label">วัน/เดือน/ปีที่เริ่มงาน:</label>
                    <input className="text-small account-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={userLoading || loading} data-testid="account-startdate-input" />
                </div>
                <div>
                    {/* Job Type Selection */}
                    <label className="text-small account-label">ลักษณะงาน:</label>
                    <select className="text-small account-input" value={jobType} onChange={(e) => setJobType(e.target.value)} disabled={optionsLoading || userLoading || loading} data-testid="account-jobtype-select">
                        <option value="" disabled>-- โปรดเลือกลักษณะงาน --</option>
                        {jobTypes.map((jt) => (
                            <option key={jt.id} value={jt.description}>{jt.description}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="text-small account-button" disabled={loading || optionsLoading || userLoading} data-testid="account-save-button">
                    <span className="text-small-without-color">{loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
                </button>
                <button type="button" className="text-small account-button-logout" onClick={() => logout()} data-testid="account-logout-button">
                    <span className="text-small-without-color">ออกจากระบบ</span>
                </button>
            </form>
        </div>
    );
}

export default PageAccount;