
import java.lang.*;

class dailyneeds {

	int sugar = 3;
	static int wheat = 5;
	int water = 20;

	void drink() {
		System.out.println("water:"+water);
		System.out.println("wheat:"+wheat);
		System.out.println("sugar:"+sugar);

		System.out.println("Drink water 5 to 6 liter daily");

	} 

	static void making() {

		System.out.println("wheat"+wheat);

		dailyneeds obj2 = new dailyneeds();
		System.out.println("sugar:"+obj2.sugar);
				
		System.out.println("sugar and wheat is used for many eating dishes");

	}

}

class human {

	public static void main(String[] args) {

		dailyneeds obj = new dailyneeds();

		obj.drink();

		obj.making();

		dailyneeds.making();

	}

}
