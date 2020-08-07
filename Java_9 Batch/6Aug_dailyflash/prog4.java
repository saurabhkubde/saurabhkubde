class Max {

	public static void  main(String[] args) {
	int max = 1 , dig;
		for(int num = 12345;num > 0;num = num / 10) {

			dig = num % 10;
			
			if(dig >= max)
				max = dig;

	
		}
		System.out.println(max);
		
	}//main

}//class
