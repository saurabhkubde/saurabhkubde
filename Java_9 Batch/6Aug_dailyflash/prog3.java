class DigitCount {
	static  int  num = 1000;

	public static void  main(String[] args) {
	
		for(int  i = 1;i<=1000;i++) {

		if(i % 32 == 0 && i % 7 == 0)
			System.out.print(" " +i);
		if(i % 32 == 0 && i % 7 == 0 && i % 6 == 0){
			System.out.println("\nbreaking loop");
			System.out.println("is divisibleby 6 :"+i);
			break;

		}
		}//for

		
	}//main

}//class
