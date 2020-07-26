class bitwise {

	public static void main(String[] args) {

		int num = 20;

		num >>>= 2 ;
		System.out.println(" num >>>= 2 = "+num);
		
		num >>= 2;
		System.out.println(" num >>= 2 = "+num);
		
		num ^= 2;
		System.out.println(" num ^= 2 = "+num);
		
		num = ++num;
		System.out.println(" num = ++num = "+num);
		
		num = ~num;
		System.out.println(" num = ~num = "+num);
		
		
	}

}
		
