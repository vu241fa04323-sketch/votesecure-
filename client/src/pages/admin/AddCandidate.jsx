import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Award, Upload, Image, ShieldCheck, User, Briefcase } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { electionService } from '../../services/electionService';
import { postService } from '../../services/postService';
import { useToast } from '../../context/ToastContext';

const AddCandidate = () => {
  const [searchParams] = useSearchParams();
  const initialElectionId = searchParams.get('electionId') || '';
  const initialPostId = searchParams.get('postId') || '';

  const navigate = useNavigate();
  const { showToast } = useToast();

  const [elections, setElections] = useState([]);
  const [posts, setPosts] = useState([]);

  const [formData, setFormData] = useState({
    candidateName: '',
    candidateId: '',
    electionId: initialElectionId,
    postId: initialPostId,
    department: '',
    description: '',
    status: 'Active',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [symbolFile, setSymbolFile] = useState(null);
  const [symbolPreview, setSymbolPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await electionService.getAll();
        if (res.success && res.elections.length > 0) {
          setElections(res.elections);
          if (!formData.electionId) {
            setFormData((prev) => ({ ...prev, electionId: res.elections[0]._id }));
          }
        }
      } catch (err) {
        showToast('Failed to load elections.', 'error');
      }
    };
    fetchElections();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!formData.electionId) {
        setPosts([]);
        return;
      }
      try {
        const res = await postService.getAll({ electionId: formData.electionId });
        if (res.success) {
          setPosts(res.posts);
          if (res.posts.length > 0 && (!formData.postId || !res.posts.some(p => p._id === formData.postId))) {
            setFormData((prev) => ({ ...prev, postId: res.posts[0]._id }));
          }
        }
      } catch (err) {
        console.warn('Failed to load posts for election:', err);
      }
    };
    fetchPosts();
  }, [formData.electionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'candidateId' ? value.toUpperCase() : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSymbolChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSymbolFile(file);
      setSymbolPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.electionId || !formData.postId) {
      showToast('Please select both an election and a contested position.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const submission = new FormData();
      Object.keys(formData).forEach((key) => {
        submission.append(key, formData[key]);
      });
      if (photoFile) submission.append('photo', photoFile);
      if (symbolFile) submission.append('symbol', symbolFile);

      const res = await candidateService.create(submission);
      if (res.success) {
        showToast(`Candidate ${res.candidate.candidateName} registered successfully!`, 'success');
        navigate(`/admin/candidates?electionId=${formData.electionId}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register candidate.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/admin/candidates"
        className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Candidate Roster</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
        <div className="mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Register Contesting Candidate
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Assign candidate details, portraits, and ballot symbol graphics to contested positions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Election and Position selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Contested Election *
              </label>
              <select
                name="electionId"
                required
                value={formData.electionId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- Choose Election --</option>
                {elections.map((elec) => (
                  <option key={elec._id} value={elec._id}>
                    {elec.electionName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Contested Position / Post *
              </label>
              <select
                name="postId"
                required
                disabled={!formData.electionId || posts.length === 0}
                value={formData.postId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              >
                <option value="">
                  {posts.length === 0 ? 'No positions created for this election' : '-- Choose Post --'}
                </option>
                {posts.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.postName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Identity details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Candidate Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="candidateName"
                  required
                  placeholder="e.g. Maya Lin"
                  value={formData.candidateName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Candidate ID *
              </label>
              <input
                type="text"
                name="candidateId"
                required
                placeholder="e.g. CAND-042"
                value={formData.candidateId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Department (Optional)
              </label>
              <input
                type="text"
                name="department"
                placeholder="e.g. Political Science / CS"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Candidate Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Active">Active (Eligible on Ballot)</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Candidate Description / Manifesto
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Key campaign pledges, experience, and message to voters..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Graphics upload section */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Candidate Photo */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                Candidate Portrait Photo
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>
            </div>

            {/* Candidate Symbol */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                Candidate / Party Symbol
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 p-2 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {symbolPreview ? (
                    <img src={symbolPreview} alt="Symbol" className="w-full h-full object-contain" />
                  ) : (
                    <Award className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSymbolChange}
                  className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-4">
            <Link
              to="/admin/candidates"
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />}
              <span>Save & Register Candidate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidate;
