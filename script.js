const GEMINI_API_KEY = "AIzaSyBlH08SpIF3tOghE3BonkC594mNPqzxfVo";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function testGemini() {
    const prompt = "Say hello!";
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        console.log(data);
        alert(JSON.stringify(data));
    } catch (e) {
        alert("Error: " + e.message);
    }
}
testGemini();

document.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector("#user-input");
    const sendBtn = document.querySelector("#send-btn");
    const chatContainer = document.querySelector("#chat-container");

    sendBtn.addEventListener("click", () => {
        const message = input.value.trim();
        if (message !== "") {
            addUserMessage(message);
            input.value = "";
            showTyping();
            getGeminiResponse(message);
        }
    });

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendBtn.click();
    });

    function addUserMessage(message) {
        const userBox = document.createElement("div");
        userBox.className = "user-chat-box";
        userBox.innerHTML = `
            <div class="avatar">👤</div>
            <div class="chat-content">
                <div class="user-chat-content">${message}</div>
                <div class="chat-meta">You • ${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        chatContainer.appendChild(userBox);
        scrollChatToBottom();
    }

    function addAiMessage(message) {
        removeTyping();

        const aiBox = document.createElement("div");
        aiBox.className = "ai-chat-box";

        const lines = message.split(/\n|•|- /).filter(line => line.trim() !== "");
        const chatContentDiv = document.createElement("div");
        chatContentDiv.className = "ai-chat-content";

        if (lines.length > 1) {
            const ul = document.createElement("ul");
            ul.style.paddingLeft = "20px";
            lines.forEach(line => {
                const li = document.createElement("li");
                li.textContent = line.trim();
                ul.appendChild(li);
            });
            chatContentDiv.appendChild(ul);
        } else {
            chatContentDiv.textContent = message;
        }

        aiBox.innerHTML = `
            <div class="avatar">🛒</div>
            <div class="chat-content"></div>
            <div class="chat-meta">ShopBot • ${new Date().toLocaleTimeString()}</div>
        `;

        aiBox.querySelector(".chat-content").prepend(chatContentDiv);
        chatContainer.appendChild(aiBox);
        scrollChatToBottom();
    }

    function showTyping() {
        const typingBox = document.createElement("div");
        typingBox.id = "typing-indicator";
        typingBox.className = "ai-chat-box";
        typingBox.innerHTML = `
            <div class="avatar">🛒</div>
            <div class="chat-content">
                <div class="ai-chat-content">ShopBot is thinking...</div>
            </div>
        `;
        chatContainer.appendChild(typingBox);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function removeTyping() {
        const typing = document.querySelector("#typing-indicator");
        if (typing) typing.remove();
    }

    async function getGeminiResponse(userMessage) {
        const prompt = `
You are ShopBot, an expert AI shopping assistant with deep knowledge of products, prices, and shopping trends.

Your job is to help users with:
- Product recommendations
- Price comparisons
- Finding deals and discounts
- Making informed purchase decisions
- Understanding product features and specifications
- Shopping trends and popular items

Be friendly, helpful, and respond with clear, actionable advice.

Important:
• Keep answers brief and focused (3-5 key points)
• Include specific product suggestions when relevant
• Mention price ranges when discussing products
• Highlight important features or specifications
• Suggest alternatives in different price ranges
• Always encourage comparing prices and reading reviews

User question: "${userMessage}"
`;

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error Response:", errorData);
                throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log("API Success Response:", data);

            const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (aiText && aiText.trim().length > 0) {
                addAiMessage(aiText.trim());
            } else {
                throw new Error('No valid response from API');
            }
        } catch (error) {
            console.error("Error in API call:", error);
            addAiMessage(`I apologize, but I'm having trouble connecting to the AI service. Please try again in a moment. Error: ${error.message}`);
        }
    }

    // Initialize quick question buttons
    document.querySelectorAll('.quick-question').forEach(button => {
        button.addEventListener('click', () => {
            input.value = button.textContent;
            sendBtn.click();
        });
    });

    // Tab switching logic
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.addEventListener('click', async function() {
            // Remove active from all
            document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
            
            // Show the selected tab and load its content
            if (this.id === 'chatBtn') {
                document.getElementById('chatTab').style.display = 'block';
            }
            if (this.id === 'productsBtn') {
                document.getElementById('productsTab').style.display = 'block';
                // Clear previous search results
                document.getElementById('product-results').innerHTML = '';
            }
            if (this.id === 'dealsBtn') {
                document.getElementById('dealsTab').style.display = 'block';
                const deals = await fetchDeals();
                renderDeals(deals);
            }
            if (this.id === 'compareBtn') {
                document.getElementById('compareTab').style.display = 'block';
                const comparisonProducts = await fetchProductsForComparison();
                renderComparison(comparisonProducts);
            }
            if (this.id === 'trendsBtn') {
                document.getElementById('trendsTab').style.display = 'block';
                const trendingProducts = await fetchTrendingProducts();
                renderTrends(trendingProducts);
            }
        });
    });

    // Product search using Fake Store API
    async function searchProducts(query) {
        const url = `https://fakestoreapi.com/products`;
        try {
            const res = await fetch(url);
            const products = await res.json();
            
            // Filter products based on search query
            const filteredProducts = products.filter(product => 
                product.title.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase())
            );
            
            return filteredProducts;
        } catch (err) {
            document.getElementById('product-results').innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
            return [];
        }
    }

    function renderProducts(products) {
        const resultsDiv = document.getElementById('product-results');
        resultsDiv.innerHTML = '';
        
        if (!products.length) {
            resultsDiv.innerHTML = '<p>No products found.</p>';
            return;
        }

        const productsGrid = document.createElement('div');
        productsGrid.className = 'products-grid';
        productsGrid.style.display = 'grid';
        productsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        productsGrid.style.gap = '20px';
        productsGrid.style.padding = '20px';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = "product-card";
            card.style.border = '1px solid var(--border-color)';
            card.style.borderRadius = 'var(--border-radius)';
            card.style.padding = '15px';
            card.style.backgroundColor = '#fff';
            card.style.boxShadow = 'var(--shadow)';
            card.style.transition = 'var(--transition)';
            
            card.innerHTML = `
                <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 200px; object-fit: contain; margin-bottom: 10px;">
                <h4 style="margin: 10px 0; font-size: 1.1rem;">${product.title}</h4>
                <p style="color: var(--primary-color); font-weight: 600; font-size: 1.2rem;">$${product.price}</p>
                <p style="color: var(--gray-color); font-size: 0.9rem; margin: 5px 0;">${product.category}</p>
                <button class="view-product-btn" style="background: linear-gradient(90deg, var(--primary-color) 60%, var(--secondary-color) 100%); 
                    color: white; border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer; 
                    margin-top: 10px; width: 100%;">View Product</button>
            `;
            
            productsGrid.appendChild(card);
        });

        resultsDiv.appendChild(productsGrid);
    }

    // Add event listener for product search form
    document.getElementById('product-search-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = document.getElementById('product-search-input').value.trim();
        if (query) {
            const products = await searchProducts(query);
            renderProducts(products);
        }
    });

    function scrollChatToBottom() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    // Deals data
    async function fetchDeals() {
        try {
            const response = await fetch('https://fakestoreapi.com/products?limit=6');
            const products = await response.json();
            
            // Add discount to products to create deals
            const deals = products.map(product => ({
                ...product,
                discount: Math.floor(Math.random() * 50) + 10, // Random discount between 10-60%
                originalPrice: (product.price * (1 + Math.random() * 0.5)).toFixed(2) // Random original price
            }));
            
            return deals;
        } catch (error) {
            console.error('Error fetching deals:', error);
            return [];
        }
    }

    function renderDeals(deals) {
        const dealsContainer = document.getElementById('dealsTab').querySelector('.section-content');
        dealsContainer.innerHTML = `
            <h2>Hot Deals</h2>
            <div class="deals-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; padding: 20px;">
                ${deals.map(deal => `
                    <div class="deal-card" style="border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 15px; background: #fff; box-shadow: var(--shadow);">
                        <div style="position: relative;">
                            <img src="${deal.image}" alt="${deal.title}" style="width: 100%; height: 200px; object-fit: contain;">
                            <div style="position: absolute; top: 10px; right: 10px; background: var(--danger-color); color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold;">
                                ${deal.discount}% OFF
                            </div>
                        </div>
                        <h4 style="margin: 10px 0; font-size: 1.1rem;">${deal.title}</h4>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <p style="color: var(--primary-color); font-weight: 600; font-size: 1.2rem;">$${deal.price}</p>
                            <p style="color: var(--gray-color); text-decoration: line-through; font-size: 0.9rem;">$${deal.originalPrice}</p>
                        </div>
                        <p style="color: var(--gray-color); font-size: 0.9rem; margin: 5px 0;">${deal.category}</p>
                        <button class="view-deal-btn" style="background: linear-gradient(90deg, var(--primary-color) 60%, var(--secondary-color) 100%); 
                            color: white; border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer; 
                            margin-top: 10px; width: 100%;">Get Deal</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Compare data
    async function fetchProductsForComparison() {
        try {
            const response = await fetch('https://fakestoreapi.com/products?limit=4');
            return await response.json();
        } catch (error) {
            console.error('Error fetching products for comparison:', error);
            return [];
        }
    }

    function renderComparison(products) {
        const compareContainer = document.getElementById('compareTab').querySelector('.section-content');
        compareContainer.innerHTML = `
            <h2>Product Comparison</h2>
            <div class="comparison-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background: var(--primary-color); color: white;">
                            <th style="padding: 15px; text-align: left;">Feature</th>
                            ${products.map(product => `
                                <th style="padding: 15px; text-align: center;">
                                    <img src="${product.image}" alt="${product.title}" style="width: 100px; height: 100px; object-fit: contain;">
                                    <div>${product.title}</div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 15px; font-weight: bold;">Price</td>
                            ${products.map(product => `
                                <td style="padding: 15px; text-align: center;">$${product.price}</td>
                            `).join('')}
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 15px; font-weight: bold;">Category</td>
                            ${products.map(product => `
                                <td style="padding: 15px; text-align: center;">${product.category}</td>
                            `).join('')}
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 15px; font-weight: bold;">Rating</td>
                            ${products.map(product => `
                                <td style="padding: 15px; text-align: center;">${product.rating?.rate || 'N/A'}</td>
                            `).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    // Shopping Trends data
    async function fetchTrendingProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products?limit=8');
            const products = await response.json();
            
            // Add trend data
            return products.map(product => ({
                ...product,
                trend: Math.random() > 0.5 ? 'up' : 'down',
                trendPercentage: (Math.random() * 20).toFixed(1)
            }));
        } catch (error) {
            console.error('Error fetching trending products:', error);
            return [];
        }
    }

    function renderTrends(trendingProducts) {
        const trendsContainer = document.getElementById('trendsTab').querySelector('.section-content');
        trendsContainer.innerHTML = `
            <h2>Shopping Trends</h2>
            <div class="trends-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; padding: 20px;">
                ${trendingProducts.map(product => `
                    <div class="trend-card" style="border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 15px; background: #fff; box-shadow: var(--shadow);">
                        <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 200px; object-fit: contain; margin-bottom: 10px;">
                        <h4 style="margin: 10px 0; font-size: 1.1rem;">${product.title}</h4>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <p style="color: var(--primary-color); font-weight: 600; font-size: 1.2rem;">$${product.price}</p>
                            <div style="display: flex; align-items: center; gap: 5px;">
                                <i class="fas fa-${product.trend === 'up' ? 'arrow-up' : 'arrow-down'}" 
                                   style="color: ${product.trend === 'up' ? 'var(--secondary-color)' : 'var(--danger-color)'}"></i>
                                <span style="color: ${product.trend === 'up' ? 'var(--secondary-color)' : 'var(--danger-color)'}">
                                    ${product.trendPercentage}%
                                </span>
                            </div>
                        </div>
                        <p style="color: var(--gray-color); font-size: 0.9rem; margin: 5px 0;">${product.category}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Initialize all tabs when DOM is loaded
    document.addEventListener('DOMContentLoaded', async () => {
        // ... existing DOMContentLoaded code ...

        // Initialize deals tab
        const deals = await fetchDeals();
        renderDeals(deals);

        // Initialize compare tab
        const comparisonProducts = await fetchProductsForComparison();
        renderComparison(comparisonProducts);

        // Initialize trends tab
        const trendingProducts = await fetchTrendingProducts();
        renderTrends(trendingProducts);

        // Set initial active tab
        document.getElementById('chatBtn').click();
    });
});
