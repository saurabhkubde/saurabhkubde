class dominos {
	int price,quantity;
	static int total = 0;

	
		 void bill() {
			System.out.println("price ="+price);
			System.out.println("quntity ="+quantity);
			total =total + price * quantity;
		}

		static void print() {
			
			System.out.println("total Cost="+total);
		}


	public static void main(String [] args) {
		dominos pizza = new dominos();
		pizza.price = 200;
		pizza.quantity = 2;
		pizza.bill();
		
		dominos fires = new dominos();
		fires.price = 50;
		fires.quantity = 3;

		fires.bill();

		fires.print();

	}

}
