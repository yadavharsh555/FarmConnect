// public/js/fetchContract.js
export function fetchContractInfo(contractId) {
    fetch(`/contracts/${contractId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.contract) {
                console.error('Contract data is missing');
                alert('Error: Contract not found.');
                return;
            }
            
            const contract = data.contract;

            // Create modal content with fallback for missing user details
            const modalContent = `
                <p><strong>Contract ID:</strong> ${contract._id || 'N/A'}</p>
                <p><strong>User Name:</strong> ${contract.user && contract.user.name ? contract.user.name : 'N/A'}</p>
                <p><strong>User Number:</strong> ${contract.user && contract.user.number ? contract.user.number : 'N/A'}</p>
                <p><strong>User Email:</strong> ${contract.user && contract.user.email ? contract.user.email : 'N/A'}</p>
                <p><strong>User Role:</strong> ${contract.user && contract.user.role ? contract.user.role : 'N/A'}</p>
                <p><strong>User State:</strong> ${contract.user && contract.user.state ? contract.user.state : 'N/A'}</p>
                <p><strong>User City:</strong> ${contract.user && contract.user.city ? contract.user.city : 'N/A'}</p>
            `;

            // Set modal content
            document.getElementById('modalContent').innerHTML = modalContent;

            // Show the modal
            document.getElementById('negotiationModal').classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error fetching contract information:', error);
            alert('Error fetching contract information. Please try again later.');
        });
}

// Function to close the modal
export function closeModal() {
    document.getElementById('negotiationModal').classList.add('hidden');
}
