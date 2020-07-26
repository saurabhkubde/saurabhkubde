class logical {

	public static void main (String[] args) {
		int i = 5, j = 4;
	   	boolean ans1, ans2 ;

		ans1 = (i++ >= j++) && (--j < i++);
		System.out.println("ans1 = "+ans1);

		ans2 = (--i < j--) || (j++ >= ++i);
		System.out.println("ans2 = "+ans2);

	}

}
	

