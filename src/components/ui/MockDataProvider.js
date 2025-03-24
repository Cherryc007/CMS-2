// Mock data for the papers
export const mockPapers = [
  {
    id: "p001",
    title: "Advanced Neural Networks in Image Recognition",
    abstract: "This paper explores the latest advancements in neural networks for image recognition applications. We propose a novel architecture that improves accuracy by 15% while reducing computational requirements. The approach leverages attention mechanisms and hierarchical feature extraction to achieve state-of-the-art results on standard benchmarks.",
    author: "Dr. Jane Smith",
    submissionDate: "2024-04-01",
    conference: "AI & ML Conference 2025",
    status: "pending",
    fileUrl: "#",
    fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Maecenas euismod, nisl eget ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Nulla facilisi. Maecenas euismod, nisl eget ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. This is a sample full text for demonstration purposes.",
    reviewers: []
  },
  {
    id: "p002",
    title: "Blockchain Integration with IoT Systems",
    abstract: "An exploration of how blockchain technology can secure IoT ecosystems. This paper presents a framework for implementing decentralized security protocols in resource-constrained IoT environments, addressing key challenges in authentication, data integrity, and privacy preservation.",
    author: "Prof. Michael Johnson",
    submissionDate: "2024-03-29",
    conference: "Blockchain Innovations 2025",
    status: "pending",
    fileUrl: "#",
    fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Maeceans euismod, nisl eget ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Nulla facilisi. Maecenas euismod, nisl eget ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. This is a sample full text for demonstration purposes.",
    reviewers: []
  },
  {
    id: "p003",
    title: "Sustainable Computing: Energy Optimization in Data Centers",
    abstract: "This research presents new methodologies for reducing energy consumption in large-scale data centers. By combining advanced scheduling algorithms with hardware-level optimizations, we demonstrate energy savings of up to 30% without compromising computational performance or reliability.",
    author: "Dr. Sarah Chen",
    submissionDate: "2024-03-27",
    conference: "IoT & Smart Systems Expo",
    status: "pending",
    fileUrl: "#",
    fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Maecenas euismod, nisl eget ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Nulla facilisi. Maecenas euismod, nisl eget ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. This is a sample full text for demonstration purposes.",
    reviewers: []
  }
];

// Mock data for available reviewers
export const mockReviewers = [
  { id: "r001", name: "Dr. Robert Wilson", expertise: "AI & Machine Learning" },
  { id: "r002", name: "Prof. Emily Taylor", expertise: "Blockchain & Cybersecurity" },
  { id: "r003", name: "Dr. David Park", expertise: "Data Science & Analytics" },
  { id: "r004", name: "Prof. Lisa Chen", expertise: "IoT & Smart Systems" },
  { id: "r005", name: "Dr. Mark Johnson", expertise: "Web Technologies" }
];

// Status options
export const statusOptions = [
  { value: "accepted", label: "Accept Paper" },
  { value: "rejected", label: "Reject Paper" },
  { value: "revisions_required", label: "Revisions Required" },
  { value: "pending", label: "Keep Pending" }
]; 