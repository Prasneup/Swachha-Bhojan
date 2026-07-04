// Online Food Ordering System with Wallet & Payment System

import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// Payment related classes
abstract class Payment {
    protected String paymentId;
    protected double amount;
    protected LocalDateTime timestamp;
    protected PaymentStatus status;

    public Payment(double amount) {
        this.paymentId = "PAY" + System.currentTimeMillis();
        this.amount = amount;
        this.timestamp = LocalDateTime.now();
        this.status = PaymentStatus.PENDING;
    }

    public abstract boolean processPayment();
    
    public String getPaymentId() { return paymentId; }
    public double getAmount() { return amount; }
    public PaymentStatus getStatus() { return status; }
    public LocalDateTime getTimestamp() { return timestamp; }
}

enum PaymentStatus {
    PENDING, SUCCESS, FAILED, REFUNDED
}

enum PaymentMethod {
    WALLET, CARD, UPI, CASH_ON_DELIVERY
}

class WalletPayment extends Payment {
    private Wallet wallet;

    public WalletPayment(double amount, Wallet wallet) {
        super(amount);
        this.wallet = wallet;
    }

    @Override
    public boolean processPayment() {
        if (wallet.getBalance() >= amount) {
            wallet.deductBalance(amount);
            this.status = PaymentStatus.SUCCESS;
            System.out.println("✅ Payment successful via Wallet!");
            System.out.println("Remaining wallet balance: Rs. " + wallet.getBalance());
            return true;
        } else {
            this.status = PaymentStatus.FAILED;
            System.out.println("❌ Payment failed! Insufficient wallet balance.");
            System.out.println("Your balance: Rs. " + wallet.getBalance() + " | Required: Rs. " + amount);
            return false;
        }
    }
}

class CardPayment extends Payment {
    private String cardNumber;
    private String cardHolderName;

    public CardPayment(double amount, String cardNumber, String cardHolderName) {
        super(amount);
        this.cardNumber = cardNumber;
        this.cardHolderName = cardHolderName;
    }

    @Override
    public boolean processPayment() {
        // Simulate card payment processing
        System.out.println("Processing card payment...");
        try {
            Thread.sleep(2000); // Simulate processing time
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Simulate 95% success rate
        if (Math.random() < 0.95) {
            this.status = PaymentStatus.SUCCESS;
            System.out.println("✅ Card payment successful!");
            String lastFour = cardNumber.length() >= 4 ? cardNumber.substring(cardNumber.length() - 4) : cardNumber;
            System.out.println("Card ending with: ****" + lastFour);
            return true;
        } else {
            this.status = PaymentStatus.FAILED;
            System.out.println("❌ Card payment failed! Please try again.");
            return false;
        }
    }
}

class UPIPayment extends Payment {
    private String upiId;

    public UPIPayment(double amount, String upiId) {
        super(amount);
        this.upiId = upiId;
    }

    @Override
    public boolean processPayment() {
        System.out.println("Processing UPI payment...");
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Simulate 90% success rate
        if (Math.random() < 0.90) {
            this.status = PaymentStatus.SUCCESS;
            System.out.println("✅ UPI payment successful!");
            System.out.println("UPI ID: " + upiId);
            return true;
        } else {
            this.status = PaymentStatus.FAILED;
            System.out.println("❌ UPI payment failed! Please try again.");
            return false;
        }
    }
}

class CashOnDeliveryPayment extends Payment {
    public CashOnDeliveryPayment(double amount) {
        super(amount);
    }

    @Override
    public boolean processPayment() {
        this.status = PaymentStatus.SUCCESS;
        System.out.println("✅ Cash on Delivery selected!");
        System.out.println("💰 Please keep Rs. " + amount + " ready for delivery.");
        return true;
    }
}

class Wallet {
    private double balance;
    private List<String> transactionHistory;

    public Wallet(double initialBalance) {
        this.balance = initialBalance;
        this.transactionHistory = new ArrayList<>();
        addTransaction("Initial balance: +Rs. " + initialBalance);
    }

    public double getBalance() {
        return balance;
    }

    public void addBalance(double amount) {
        balance += amount;
        addTransaction("Added: +Rs. " + amount + " | Balance: Rs. " + balance);
        System.out.println("✅ Rs. " + amount + " added to wallet successfully!");
    }

    public boolean deductBalance(double amount) {
        if (balance >= amount) {
            balance -= amount;
            addTransaction("Payment: -Rs. " + amount + " | Balance: Rs. " + balance);
            return true;
        }
        return false;
    }

    private void addTransaction(String transaction) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"));
        transactionHistory.add("[" + timestamp + "] " + transaction);
    }

    public void showTransactionHistory() {
        System.out.println("\n--- Wallet Transaction History ---");
        if (transactionHistory.isEmpty()) {
            System.out.println("No transactions found.");
        } else {
            for (String transaction : transactionHistory) {
                System.out.println(transaction);
            }
        }
        System.out.println("Current Balance: Rs. " + balance);
        System.out.println("----------------------------------\n");
    }
}

class PaymentProcessor {
    public static Payment createPayment(PaymentMethod method, double amount, Wallet wallet, Scanner sc) {
        switch (method) {
            case WALLET:
                return new WalletPayment(amount, wallet);
            
            case CARD:
                System.out.print("Enter card number (16 digits): ");
                String cardNumber = sc.nextLine();
                System.out.print("Enter card holder name: ");
                String cardHolderName = sc.nextLine();
                return new CardPayment(amount, cardNumber, cardHolderName);
            
            case UPI:
                System.out.print("Enter UPI ID: ");
                String upiId = sc.nextLine();
                return new UPIPayment(amount, upiId);
            
            case CASH_ON_DELIVERY:
                return new CashOnDeliveryPayment(amount);
            
            default:
                return null;
        }
    }
}

// Original classes with modifications
class MenuItem {
    private String name;
    private double price;
    private String category;

    public MenuItem(String name, double price, String category) {
        this.name = name;
        this.price = price;
        this.category = category;
    }

    public String getName() { return name; }
    public double getPrice() { return price; }
    public String getCategory() { return category; }

    @Override
    public String toString() {
        return name + " (" + category + ") - Rs. " + String.format("%.2f", price);
    }
}

class Customer {
    private String name;
    private String phone;
    private String address;
    private Wallet wallet;

    public Customer(String name, String phone, String address) {
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.wallet = new Wallet(500.0); // Initial wallet balance
    }

    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public Wallet getWallet() { return wallet; }
}

class Restaurant {
    private String name;
    private List<MenuItem> menu = new ArrayList<>();

    public Restaurant(String name) {
        this.name = name;
    }

    public void addMenuItem(MenuItem item) {
        menu.add(item);
    }

    public List<MenuItem> getMenu() { return menu; }
    public String getName() { return name; }

    public List<MenuItem> displayMenuByCategory() {
        Map<String, List<MenuItem>> categoryMap = new LinkedHashMap<>();
        
        for (MenuItem item : menu) {
            categoryMap.computeIfAbsent(item.getCategory(), k -> new ArrayList<>()).add(item);
        }

        List<MenuItem> displayedItems = new ArrayList<>();
        int itemNumber = 1;
        for (Map.Entry<String, List<MenuItem>> entry : categoryMap.entrySet()) {
            System.out.println("\n--- " + entry.getKey().toUpperCase() + " ---");
            for (MenuItem item : entry.getValue()) {
                System.out.println(itemNumber + ". " + item);
                displayedItems.add(item);
                itemNumber++;
            }
        }
        return displayedItems;
    }
}

class OrderItem {
    private MenuItem menuItem;
    private int quantity;

    public OrderItem(MenuItem menuItem, int quantity) {
        this.menuItem = menuItem;
        this.quantity = quantity;
    }

    public MenuItem getMenuItem() { return menuItem; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getSubtotal() {
        return menuItem.getPrice() * quantity;
    }

    @Override
    public String toString() {
        return menuItem.getName() + " x " + quantity + " = Rs. " + String.format("%.2f", getSubtotal());
    }
}

class Order {
    private static int orderCounter = 1000;
    private int orderId;
    private Customer customer;
    private List<OrderItem> items = new ArrayList<>();
    private LocalDateTime orderTime;
    private double deliveryCharge = 50.0;
    private Payment payment;
    private OrderStatus status;

    public Order(Customer customer) {
        this.orderId = ++orderCounter;
        this.customer = customer;
        this.orderTime = LocalDateTime.now();
        this.status = OrderStatus.PENDING;
    }

    public Customer getCustomer(){
        return customer;
    }

    public void addItem(MenuItem menuItem, int quantity) {
        for (OrderItem item : items) {
            if (item.getMenuItem().getName().equals(menuItem.getName())) {
                item.setQuantity(item.getQuantity() + quantity);
                return;
            }
        }
        items.add(new OrderItem(menuItem, quantity));
    }

    public double calculateSubtotal() {
        return items.stream().mapToDouble(OrderItem::getSubtotal).sum();
    }

    public double calculateTotal() {
        double subtotal = calculateSubtotal();
        return subtotal > 500 ? subtotal : subtotal + deliveryCharge;
    }

    public boolean isEmpty() { return items.isEmpty(); }

    public boolean processPayment(PaymentMethod method, Scanner sc) {
        Payment payment = PaymentProcessor.createPayment(method, calculateTotal(), customer.getWallet(), sc);
        if (payment != null && payment.processPayment()) {
            this.payment = payment;
            this.status = OrderStatus.CONFIRMED;
            return true;
        }
        return false;
    }

    public void printReceipt() {
        System.out.println("\n" + "=".repeat(50));
        System.out.println("                ORDER RECEIPT");
        System.out.println("=".repeat(50));
        System.out.println("Order ID: " + orderId);
        System.out.println("Date: " + orderTime.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")));
        System.out.println("Status: " + status);
        System.out.println("Customer: " + customer.getName());
        System.out.println("Phone: " + customer.getPhone());
        System.out.println("Address: " + customer.getAddress());
        System.out.println("-".repeat(50));
        
        displayItems(); // Use the new method
        
        System.out.println("-".repeat(50));
        System.out.printf("Subtotal: Rs. %.2f%n", calculateSubtotal());
        
        if (calculateSubtotal() <= 500) {
            System.out.printf("Delivery Charge: Rs. %.2f%n", deliveryCharge);
        } else {
            System.out.println("Delivery Charge: FREE (Order > Rs. 500)");
        }
        
        System.out.printf("TOTAL: Rs. %.2f%n", calculateTotal());
        
        if (payment != null) {
            System.out.println("-".repeat(50));
            System.out.println("Payment ID: " + payment.getPaymentId());
            System.out.println("Payment Status: " + payment.getStatus());
            System.out.println("Payment Time: " + payment.getTimestamp().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")));
        }
        
        System.out.println("=".repeat(50));
        System.out.println("Estimated Delivery Time: 30-45 minutes");
        System.out.println("Thank you for your order! 🍽️");
        System.out.println("=".repeat(50) + "\n");
    }

    // New method to display items
    public void displayItems() {
        for (OrderItem item : items) {
            System.out.println(item);
        }
    }
    // ... rest of the Order class remains unchanged
}

enum OrderStatus {
    PENDING, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
}

public class FoodOrderingSystemWithPayment {
    private static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {
        Restaurant restaurant = initializeRestaurant();
        
        System.out.println("🍽️  Welcome to " + restaurant.getName() + " 🍽️");
        System.out.println("Your favorite online food ordering system with secure payments!");

        Customer customer = getCustomerDetails();
        Order order = new Order(customer);

        boolean running = true;
        while (running) {
            displayMainMenu();
            int choice = getValidChoice(1, 6);

            switch (choice) {
                case 1:
                    viewMenu(restaurant);
                    break;
                case 2:
                    addItemToOrder(restaurant, order);
                    break;
                case 3:
                    viewCart(order);
                    break;
                case 4:
                    manageWallet(customer.getWallet());
                    break;
                case 5:
                    if (placeOrder(order)) {
                        running = false;
                    }
                    break;
                case 6:
                    System.out.println("Thank you for visiting! 👋");
                    running = false;
                    break;
            }
        }
        
        sc.close();
    }

    private static Restaurant initializeRestaurant() {
        Restaurant restaurant = new Restaurant("Tasty Bites");
        
        restaurant.addMenuItem(new MenuItem("Chicken Momo", 150, "Appetizers"));
        restaurant.addMenuItem(new MenuItem("Veg Momo", 120, "Appetizers"));
        restaurant.addMenuItem(new MenuItem("Chicken Chowmein", 140, "Main Course"));
        restaurant.addMenuItem(new MenuItem("Veg Chowmein", 110, "Main Course"));
        restaurant.addMenuItem(new MenuItem("Chicken Burger", 180, "Fast Food"));
        restaurant.addMenuItem(new MenuItem("Veg Burger", 150, "Fast Food"));
        restaurant.addMenuItem(new MenuItem("Margherita Pizza", 280, "Pizza"));
        restaurant.addMenuItem(new MenuItem("Chicken Pizza", 350, "Pizza"));
        restaurant.addMenuItem(new MenuItem("Coke", 60, "Beverages"));
        restaurant.addMenuItem(new MenuItem("Lassi", 80, "Beverages"));

        return restaurant;
    }

    private static Customer getCustomerDetails() {
        System.out.println("\n--- Customer Registration ---");
        System.out.print("Enter your name: ");
        String name = sc.nextLine();
        System.out.print("Enter your phone number: ");
        String phone = sc.nextLine();
        System.out.print("Enter your delivery address: ");
        String address = sc.nextLine();
        
        Customer customer = new Customer(name, phone, address);
        System.out.println("🎉 Welcome " + name + "! You get Rs. 500 in your wallet as a welcome bonus!");
        
        return customer;
    }

    private static void displayMainMenu() {
        System.out.println("\n--- MAIN MENU ---");
        System.out.println("1. 🍽️  View Menu");
        System.out.println("2. 🛒 Add Item to Cart");
        System.out.println("3. 👀 View Cart");
        System.out.println("4. 💰 Manage Wallet");
        System.out.println("5. 🚀 Place Order & Pay");
        System.out.println("6. 🚪 Exit");
        System.out.print("Enter your choice: ");
    }

    private static List<MenuItem> viewMenu(Restaurant restaurant) {
        System.out.println("\n🍽️  MENU  🍽️");
        return restaurant.displayMenuByCategory();
    }

    private static void addItemToOrder(Restaurant restaurant, Order order) {
        List<MenuItem> displayedMenu = viewMenu(restaurant);
        
        System.out.print("\nEnter item number to add to cart (0 to go back): ");
        int choice = getValidChoice(0, displayedMenu.size());
        
        if (choice == 0) return;
        
        System.out.print("Enter quantity: ");
        int quantity = getValidQuantity();
        
        order.addItem(displayedMenu.get(choice - 1), quantity);
        System.out.println("✅ " + displayedMenu.get(choice - 1).getName() + " x " + quantity + " added to cart!");
    }

    private static void viewCart(Order order) {
        if (order.isEmpty()) {
            System.out.println("🛒 Your cart is empty!");
            return;
        }
        
        System.out.println("\n🛒 YOUR CART");
        System.out.println("-".repeat(30));
        order.displayItems(); // Use the new displayItems method
        System.out.println("-".repeat(30));
        System.out.printf("Total: Rs. %.2f%n", order.calculateTotal());
    }

    private static void manageWallet(Wallet wallet) {
        System.out.println("\n💰 WALLET MANAGEMENT");
        System.out.println("Current Balance: Rs. " + wallet.getBalance());
        System.out.println("1. Add Money");
        System.out.println("2. Transaction History");
        System.out.println("3. Back to Main Menu");
        System.out.print("Choose option: ");
        
        int choice = getValidChoice(1, 3);
        
        switch (choice) {
            case 1:
                System.out.print("Enter amount to add: Rs. ");
                double amount = getValidAmount();
                wallet.addBalance(amount);
                break;
            case 2:
                wallet.showTransactionHistory();
                break;
            case 3:
                return;
        }
    }

    private static boolean placeOrder(Order order) {
        if (order.isEmpty()) {
            System.out.println("🛒 Your cart is empty! Add some items first.");
            return false;
        }
    
        viewCart(order);
        System.out.println("\n💳 SELECT PAYMENT METHOD");
        System.out.println("1. 💰 Wallet (Balance: Rs. " + order.getCustomer().getWallet().getBalance() + ")"); // Updated line
        System.out.println("2. 💳 Credit/Debit Card");
        System.out.println("3. 📱 UPI Payment");
        System.out.println("4. 💵 Cash on Delivery");
        System.out.print("Choose payment method: ");
    
        int paymentChoice = getValidChoice(1, 4);
        PaymentMethod method = PaymentMethod.values()[paymentChoice - 1];
    
        System.out.println("\nProcessing your order...");
        if (order.processPayment(method, sc)) {
            order.printReceipt();
            return true;
        } else {
            System.out.println("❌ Order failed! Please try again with a different payment method.");
            return false;
        }
    }

    private static int getValidChoice(int min, int max) {
        while (true) {
            try {
                int choice = sc.nextInt();
                sc.nextLine();
                if (choice >= min && choice <= max) {
                    return choice;
                }
                System.out.print("Invalid choice. Enter between " + min + " and " + max + ": ");
            } catch (InputMismatchException e) {
                System.out.print("Please enter a valid number: ");
                sc.nextLine();
            }
        }
    }

    private static int getValidQuantity() {
        while (true) {
            try {
                int quantity = sc.nextInt();
                sc.nextLine();
                if (quantity > 0) return quantity;
                System.out.print("Quantity must be greater than 0: ");
            } catch (InputMismatchException e) {
                System.out.print("Please enter a valid quantity: ");
                sc.nextLine();
            }
        }
    }

    private static double getValidAmount() {
        while (true) {
            try {
                double amount = sc.nextDouble();
                sc.nextLine();
                if (amount > 0) return amount;
                System.out.print("Amount must be greater than 0: ");
            } catch (InputMismatchException e) {
                System.out.print("Please enter a valid amount: ");
                sc.nextLine();
            }
        }
    }
}